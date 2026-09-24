"""Tarefa 0.5 - Mapeamento de coincidencias da BSM de Charlie (MDI-QKD).

Modelo: dois fotons indistinguiveis, um de Alice (modo a) e um de Bob (modo b), cada um com
polarizacao H ou V. BS central 50:50 (a -> (c + d)/sqrt2, b -> (c - d)/sqrt2); a saida c alimenta o
PBS esquerdo (Det 2 e Det 3) e a saida d alimenta o PBS direito (Det 0 e Det 1), como na figura do
roteiro UA3/UA4. O PBS transmite H e reflete V. As duas convencoes de porta sao testadas:
  convencao A: Det2 = c_H, Det3 = c_V, Det0 = d_H, Det1 = d_V (transmitido = porta horizontal da figura)
  convencao B: Det2 = c_V, Det3 = c_H, Det0 = d_V, Det1 = d_H (portas trocadas nos dois PBS)

Calculo exato com operadores de criacao bosonicos: o estado de dois fotons e um polinomio
homogeneo de grau 2 nos operadores de saida; a probabilidade de cada par de detectores e
|coeficiente|^2 * (produto dos fatoriais das ocupacoes).
"""
import sys
from collections import defaultdict
from itertools import product
from math import factorial, sqrt

sys.stdout.reconfigure(encoding="utf-8")

R2 = 1 / sqrt(2)
# modo de entrada -> combinacao linear de modos de saida do BS (mesma polarizacao)
BS = {"a": {"c": R2, "d": R2}, "b": {"c": R2, "d": -R2}}

CONVENCOES = {
    "A": {("c", "H"): "Det2", ("c", "V"): "Det3", ("d", "H"): "Det0", ("d", "V"): "Det1"},
    "B": {("c", "V"): "Det2", ("c", "H"): "Det3", ("d", "V"): "Det0", ("d", "H"): "Det1"},
}

# estados de Bell como combinacao de a_pol1^dag b_pol2^dag
BELL = {
    "psi+": {("H", "V"): R2, ("V", "H"): R2},
    "psi-": {("H", "V"): R2, ("V", "H"): -R2},
    "phi+": {("H", "H"): R2, ("V", "V"): R2},
    "phi-": {("H", "H"): R2, ("V", "V"): -R2},
}


def distribuicao(estado, mapa):
    """Probabilidade de cada combinacao de cliques (par de detectores ou dois fotons no mesmo)."""
    poli = defaultdict(complex)
    for (pa, pb), amp in estado.items():
        for (sa, ca), (sb, cb) in product(BS["a"].items(), BS["b"].items()):
            chave = tuple(sorted((mapa[(sa, pa)], mapa[(sb, pb)])))
            poli[chave] += amp * ca * cb
    probs = {}
    for chave, coef in poli.items():
        ocup = defaultdict(int)
        for det in chave:
            ocup[det] += 1
        peso = 1
        for n in ocup.values():
            peso *= factorial(n)
        p = abs(coef) ** 2 * peso
        if p > 1e-12:
            probs[chave] = p
    return probs


def rotulo(chave):
    return f"{chave[0]} & {chave[1]}" if chave[0] != chave[1] else f"2 fotons em {chave[0]} (sem coincidencia)"


if __name__ == "__main__":
    for nome_conv, mapa in CONVENCOES.items():
        print(f"\n## Convencao {nome_conv}\n")
        print("| estado de Bell | resultado | probabilidade | identificavel? |")
        print("|---|---|---|---|")
        for nome, estado in BELL.items():
            probs = distribuicao(estado, mapa)
            total = sum(probs.values())
            assert abs(total - 1) < 1e-12, (nome, total)
            for chave, p in sorted(probs.items()):
                coinc = chave[0] != chave[1]
                exclusivo = coinc and all(
                    chave not in distribuicao(outro, mapa) for n2, outro in BELL.items() if n2 != nome)
                print(f"| {nome} | {rotulo(chave)} | {p:.4f} | {'sim' if exclusivo else 'nao'} |")
        # eficiencia: estados de Bell equiprovaveis, sucesso = coincidencias exclusivas
        sucesso = 0.0
        for nome, estado in BELL.items():
            for chave, p in distribuicao(estado, mapa).items():
                if chave[0] != chave[1] and all(
                        chave not in distribuicao(o, mapa) for n2, o in BELL.items() if n2 != nome):
                    sucesso += 0.25 * p
        print(f"\nEficiencia da BSM linear (Bell equiprovaveis): {sucesso:.4f}")
