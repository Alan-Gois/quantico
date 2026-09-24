"""qkd_toolkit - funcoes compartilhadas pelos agentes de auditoria.

Recalculo independente BB84 / MDI-QKD, leitura de planilhas e graficos nativos,
e algebra com numeros complexos para estados de Bell / BSM.

Historico:
- v01: versao original (E:\\Trabalho\\v02 e v04).
- v06: (1) R_secret = 0 quando QBER >= Q_ZERO; (2) ValueError para L < 0 ou nao finito;
       (3) mu_fn obrigatorio em bb84() e nova mu_pns(k_seg); (4) fotons_por_pulso() com
       modo 'cw' (P x tau, padrao) ou 'pulsado' (P / f_rep); (5) atenuacao_VOA_dB() repassa
       o modo e valida mu_alvo; (6) recalcular_xlsx() usa LibreOffice ou, no Windows, Excel via COM.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

import numpy as np
from lxml import etree

# ---------- parametros de contorno (roteiros UA1-2 e UA3-4) ----------
P = dict(P_laser_mW=1.0, lam_nm=1550, f_rep=50e6, pulso_ns=10, perda_AM_dB=3, perda_PC_dB=3,
         alfa_dB_km=0.22, eta=0.20, ruido_por_ns=1e-5, janela_ns=10, ER_PBS_dB=23, QBER_max=0.10)
h_planck, c = 6.62607015e-34, 299792458.0

# Zero de 1 - 2h(Q) em (0; 0,5): acima dele a taxa secreta do modelo e nula (conferido no Wolfram).
Q_ZERO = 0.11002786443835955


def h2(x):
    """Entropia binaria de Shannon; 0 fora de (0, 1)."""
    x = np.asarray(x, float)
    with np.errstate(divide='ignore', invalid='ignore'):
        r = -x * np.log2(x) - (1 - x) * np.log2(1 - x)
    return np.where((x <= 0) | (x >= 1), 0.0, r)


def db2lin(db):
    return 10 ** (-np.asarray(db) / 10)


def P_opt(p=P):
    return db2lin(p['ER_PBS_dB'])


def P_dark(p=P):
    return p['ruido_por_ns'] * p['janela_ns']


def _validar_L(L):
    L = np.asarray(L, float)
    if not np.all(np.isfinite(L)) or np.any(L < 0):
        raise ValueError('comprimento de fibra deve ser finito e >= 0 km')
    return L


def _taxa_secreta(R_sift, qber):
    """R_secret = R_sift (1 - 2h(Q)), nula quando Q >= Q_ZERO (inclui Q >= 1)."""
    return np.where(qber < Q_ZERO, np.maximum(R_sift * (1 - 2 * h2(qber)), 0.0), 0.0)


def mu_pns(k_seg=0.99):
    """Criterio PNS do roteiro com margem: mu = k_seg * 2 * t_link, 0 < k_seg < 1 (desigualdade estrita)."""
    if not 0 < k_seg < 1:
        raise ValueError('k_seg deve estar em (0, 1) para satisfazer mu < 2 t_link')
    return lambda t: k_seg * 2 * t


def fotons_por_pulso(p=P, modo='cw'):
    """Fotons/pulso na saida do laser (antes de AM/PC/VOA).

    modo 'cw': LD continuo com pulso recortado pelo AM, E_pulso = P * tau (arranjo do roteiro).
    modo 'pulsado': toda a potencia media concentrada nos pulsos, E_pulso = P / f_rep.
    """
    E_foton = h_planck * c / (p['lam_nm'] * 1e-9)
    if modo == 'cw':
        E_pulso = p['P_laser_mW'] * 1e-3 * p['pulso_ns'] * 1e-9
    elif modo == 'pulsado':
        E_pulso = p['P_laser_mW'] * 1e-3 / p['f_rep']
    else:
        raise ValueError("modo deve ser 'cw' ou 'pulsado'")
    return E_pulso / E_foton


def atenuacao_VOA_dB(mu_alvo, p=P, incluir_AM_PC=True, modo='cw'):
    """Atenuacao que o VOA precisa impor para chegar a mu_alvo."""
    mu_alvo = np.asarray(mu_alvo, float)
    if np.any(mu_alvo <= 0):
        raise ValueError('mu_alvo deve ser > 0')
    n0 = fotons_por_pulso(p, modo)
    perdas = (p['perda_AM_dB'] + p['perda_PC_dB']) if incluir_AM_PC else 0
    return 10 * np.log10(n0 / mu_alvo) - perdas


def bb84(L, mu_fn, p=P):
    """Modelo do relatorio T1: R_sift = 0,5 f mu t eta; QBER = Popt + Pd/(t eta mu)."""
    L = _validar_L(L)
    t = db2lin(p['alfa_dB_km'] * L)
    mu = mu_fn(t)
    q = P_opt(p) + P_dark(p) / (t * p['eta'] * mu)
    Rs = 0.5 * p['f_rep'] * mu * t * p['eta']
    return dict(L=L, t=t, mu=mu, QBER=q, R_sift=Rs, R_secret=_taxa_secreta(Rs, q))


def mdi(L_braco, mu=0.5, p=P):
    """Modelo do relatorio T2: Q_C = (eta t mu)^2; e_C = Popt + Pd eta t mu / Q_C."""
    L = _validar_L(L_braco)
    t = db2lin(p['alfa_dB_km'] * L)
    Q = (p['eta'] * t * mu) ** 2
    e = P_opt(p) + P_dark(p) * p['eta'] * t * mu / Q
    Rs = 0.5 * p['f_rep'] * Q
    return dict(L=L, L_total=2 * L, t=t, Q_C=Q, QBER=e, R_sift=Rs, R_secret=_taxa_secreta(Rs, e))


def alcance_max(fn, Lgrid=np.arange(0, 300, 0.01), **kw):
    """Ultimo ponto da grade com QBER < QBER_max."""
    r = fn(Lgrid, **kw)
    ok = r['QBER'] < P['QBER_max']
    return float(Lgrid[ok][-1]) if ok.any() else None


# ---------- planilhas ----------
_PS_EXCEL = r"""
$ErrorActionPreference = 'Stop'
$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false; $xl.DisplayAlerts = $false
try {
  $wb = $xl.Workbooks.Open($args[0])
  $xl.CalculateFull()
  $wb.Save(); $wb.Close($false)
} finally {
  $xl.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($xl)
}
"""


def recalcular_xlsx(path):
    """Recalcula as formulas numa copia e devolve o caminho da copia (o original nunca e alterado).

    Usa o LibreOffice se 'soffice' estiver no PATH; senao, no Windows, o Excel via COM.
    """
    out = tempfile.mkdtemp()
    destino = os.path.join(out, os.path.basename(path))
    if shutil.which('soffice'):
        subprocess.run(['soffice', '--headless', '--convert-to', 'xlsx', '--outdir', out, path],
                       check=True, capture_output=True)
        return destino
    if sys.platform == 'win32':
        shutil.copy2(path, destino)
        script = os.path.join(out, 'recalcular_excel.ps1')
        with open(script, 'w', encoding='utf-8-sig') as f:
            f.write(_PS_EXCEL)
        subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                        '-File', script, os.path.abspath(destino)], check=True, capture_output=True, timeout=300)
        return destino
    raise RuntimeError('nem LibreOffice (soffice) nem Excel (Windows) disponiveis para recalcular a planilha')


def ler_valores(path, aba):
    import openpyxl
    wb = openpyxl.load_workbook(recalcular_xlsx(path), data_only=True)
    return [[cel.value for cel in r] for r in wb[aba].iter_rows()]


# ---------- graficos nativos (docx/xlsx) ----------
NS = {'c': 'http://schemas.openxmlformats.org/drawingml/2006/chart'}


def graficos(path):
    """Lista graficos nativos e imagens de um .docx/.xlsx com as series embutidas."""
    z = zipfile.ZipFile(path)
    res = {'nativos': [], 'imagens': [n for n in z.namelist() if '/media/' in n and not n.endswith('/')]}
    for n in sorted(x for x in z.namelist() if re.search(r'charts/chart\d+\.xml$', x)):
        root = etree.fromstring(z.read(n))
        titulo = ' '.join(root.xpath('//c:title//a:t/text()', namespaces={
            **NS, 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}))
        series = []
        for s in root.xpath('//c:ser', namespaces=NS):
            nome = ' '.join(s.xpath('c:tx//c:v/text()', namespaces=NS))
            x = s.xpath('(c:cat|c:xVal)//c:pt/c:v/text()', namespaces=NS)
            y = s.xpath('(c:val|c:yVal)//c:pt/c:v/text()', namespaces=NS)
            ref = s.xpath('(c:val|c:yVal)//c:f/text()', namespaces=NS)
            series.append(dict(nome=nome, x=[float(v) for v in x], y=[float(v) for v in y], ref=ref))
        log = bool(root.xpath('//c:logBase', namespaces=NS))
        tipo = [etree.QName(e).localname for e in root.xpath('//c:plotArea/*', namespaces=NS)
                if 'Chart' in etree.QName(e).localname]
        res['nativos'].append(dict(arquivo=n, titulo=titulo, tipo=tipo, eixo_log=log, series=series))
    return res


# ---------- numeros complexos: estados de Bell e BSM com optica linear ----------
H, V = np.array([1, 0], complex), np.array([0, 1], complex)
D, A = (H + V) / np.sqrt(2), (H - V) / np.sqrt(2)


def bell():
    k = np.kron
    return {'phi+': (k(H, H) + k(V, V)) / np.sqrt(2), 'phi-': (k(H, H) - k(V, V)) / np.sqrt(2),
            'psi+': (k(H, V) + k(V, H)) / np.sqrt(2), 'psi-': (k(H, V) - k(V, H)) / np.sqrt(2)}


def bsm_linear(estado_a, estado_b):
    """Probabilidade de cada estado de Bell para fotons de Alice e Bob (|<Bell|a (x) b>|^2).
    Com optica linear (BS 50:50 + 2 PBS) so psi+ e psi- sao identificaveis => eficiencia max. 50%."""
    s = np.kron(estado_a, estado_b)
    p = {k: float(abs(np.vdot(v, s)) ** 2) for k, v in bell().items()}
    p['sucesso_BSM_linear'] = p['psi+'] + p['psi-']
    return p


if __name__ == '__main__':
    print('fotons/pulso na saida do LD (cw): %.3e' % fotons_por_pulso())
    print('VOA p/ mu=0,5 (com AM+PC, cw): %.2f dB' % atenuacao_VOA_dB(0.5))
    print('alcance BB84 (mu=0,99*2t): %.2f km' % alcance_max(bb84, mu_fn=mu_pns()))
    print('alcance MDI (mu=0,5): %.2f km/braco' % alcance_max(mdi))
    print('BSM H(x)V:', bsm_linear(H, V))
    print('BSM D(x)A:', bsm_linear(D, A))
