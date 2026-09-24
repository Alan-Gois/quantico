"""Testes do qkd_toolkit v06. Valores de referencia conferidos no Wolfram (30 digitos).

Executar: python -m unittest test_qkd_toolkit -v  (na pasta ferramentas)
"""
import hashlib
import os
import sys
import unittest
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
import qkd_toolkit as tk

REL = 1e-6
PLANILHA_V1 = r"E:\Trabalho\v01\originais\Simulacao_BB84.xlsx"


class TestModeloBB84(unittest.TestCase):
    def test_l30(self):
        r = tk.bb84(30, mu_fn=tk.mu_pns())
        self.assertAlmostEqual(float(r['QBER']) / 0.010287872666712219, 1, delta=REL)
        self.assertAlmostEqual(float(r['R_secret']) / 395474.2315129458, 1, delta=REL)

    def test_l58(self):
        r = tk.bb84(58, mu_fn=tk.mu_pns())
        self.assertAlmostEqual(float(r['QBER']) / 0.095024784817647321, 1, delta=REL)
        self.assertAlmostEqual(float(r['R_secret']) / 2609.4511035921405, 1, delta=REL)

    def test_alcance(self):
        self.assertAlmostEqual(tk.alcance_max(tk.bb84, mu_fn=tk.mu_pns()), 58.53, places=6)

    def test_qber_absurdo_zera_taxa(self):
        r = tk.bb84(0, mu_fn=lambda t: 1e-5 * t / t)
        self.assertGreater(float(r['QBER']), 1)
        self.assertEqual(float(r['R_secret']), 0.0)

    def test_taxa_nula_a_partir_de_q_zero(self):
        # L em que a QBER cruza Q_ZERO: taxa positiva antes, nula depois
        grade = np.arange(58, 62, 0.001)
        r = tk.bb84(grade, mu_fn=tk.mu_pns())
        self.assertTrue(np.all(r['R_secret'][r['QBER'] >= tk.Q_ZERO] == 0))
        self.assertTrue(np.all(r['R_secret'][r['QBER'] < tk.Q_ZERO] > 0))

    def test_l_negativo(self):
        with self.assertRaises(ValueError):
            tk.bb84(-10, mu_fn=tk.mu_pns())
        with self.assertRaises(ValueError):
            tk.bb84(float('nan'), mu_fn=tk.mu_pns())

    def test_mu_fn_obrigatorio(self):
        with self.assertRaises(TypeError):
            tk.bb84(10)

    def test_mu_pns_invalido(self):
        for k in (1.0, 0, -0.5, 1.2):
            with self.assertRaises(ValueError):
                tk.mu_pns(k)


class TestModeloMDI(unittest.TestCase):
    def test_l40(self):
        r = tk.mdi(40)
        self.assertAlmostEqual(float(r['QBER']) / 0.012597648086564561, 1, delta=REL)
        self.assertAlmostEqual(float(r['R_secret']) / 3496.8062823576509, 1, delta=REL)

    def test_l89(self):
        self.assertAlmostEqual(float(tk.mdi(89)['R_secret']) / 2.6986342407985903, 1, delta=REL)

    def test_alcance(self):
        self.assertAlmostEqual(tk.alcance_max(tk.mdi), 89.89, places=6)

    def test_l_negativo(self):
        with self.assertRaises(ValueError):
            tk.mdi(-1)


class TestEntropia(unittest.TestCase):
    def test_valores(self):
        self.assertAlmostEqual(float(tk.h2(1e-5)) / 0.00018052328301826526, 1, delta=REL)
        self.assertAlmostEqual(float(tk.h2(0.1)) / 0.46899559358928122, 1, delta=REL)
        for x in (0, 1, -0.1, 1.1):
            self.assertEqual(float(tk.h2(x)), 0.0)

    def test_q_zero(self):
        self.assertAlmostEqual(1 - 2 * float(tk.h2(tk.Q_ZERO)), 0, places=12)


class TestParametrosFisicos(unittest.TestCase):
    def test_fotons(self):
        self.assertAlmostEqual(tk.fotons_por_pulso() / 7.80288067969119941e7, 1, delta=REL)
        self.assertAlmostEqual(tk.fotons_por_pulso(modo='pulsado') / 1.560576135938239883e8, 1, delta=REL)
        with self.assertRaises(ValueError):
            tk.fotons_por_pulso(modo='outro')

    def test_voa(self):
        self.assertAlmostEqual(float(tk.atenuacao_VOA_dB(0.5)), 75.932849614738, places=6)
        self.assertAlmostEqual(float(tk.atenuacao_VOA_dB(0.5, modo='pulsado')), 78.94314957137782, places=6)
        for mu in (0, -1):
            with self.assertRaises(ValueError):
                tk.atenuacao_VOA_dB(mu)


class TestBSM(unittest.TestCase):
    def test_eficiencia(self):
        self.assertAlmostEqual(tk.bsm_linear(tk.H, tk.V)['sucesso_BSM_linear'], 1.0, places=12)
        self.assertAlmostEqual(tk.bsm_linear(tk.D, tk.A)['sucesso_BSM_linear'], 0.5, places=12)


@unittest.skipUnless(os.path.exists(PLANILHA_V1) and sys.platform == 'win32', 'planilha v1 ou Windows ausente')
class TestRecalculoExcel(unittest.TestCase):
    def test_recalcula_copia_sem_alterar_original(self):
        antes = hashlib.sha256(Path(PLANILHA_V1).read_bytes()).hexdigest()
        linhas = tk.ler_valores(PLANILHA_V1, 'Simulacao')
        depois = hashlib.sha256(Path(PLANILHA_V1).read_bytes()).hexdigest()
        self.assertEqual(antes, depois)
        # linha 4 = L = 0 km; coluna H = R_secret com mu = 2t (planilha v1)
        self.assertAlmostEqual(linhas[3][7] / 9051905.23811304, 1, delta=REL)


if __name__ == '__main__':
    unittest.main(verbosity=2)
