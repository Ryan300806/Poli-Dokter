"""Bandingkan pola akses daftar pada data simulasi. Jalankan dengan Python 3."""
import re
import sqlite3
from pathlib import Path

project = Path(__file__).resolve().parents[1]
source = (project / "src/app/Models/DataReservasi.php").read_text(encoding="utf-8")
queue_method = source.split("function antreanPemeriksaanHariIni", 1)[1].split("function getAntreanUntukObservasi", 1)[0]
latest_joins = re.findall(r"whereRaw\('([^']+)'\)", queue_method)
if len(latest_joins) != 3:
    raise RuntimeError("Periksa kembali skenario setelah perubahan kueri antrean.")

db = sqlite3.connect(":memory:")
db.executescript("""
    CREATE TABLE antrean (id_antrean INTEGER PRIMARY KEY);
    CREATE TABLE observasi (id_observasi INTEGER PRIMARY KEY, id_antrean INTEGER, waktu_observasi INTEGER);
    CREATE TABLE diagnosis (id_diagnosis INTEGER PRIMARY KEY, id_antrean INTEGER);
    CREATE TABLE e_resep (id_e_resep INTEGER PRIMARY KEY, id_diagnosis INTEGER, status_e_resep TEXT);
    CREATE TABLE detail_e_resep (id_e_resep INTEGER, id_obat INTEGER, jumlah_obat INTEGER);
    CREATE TABLE stok_obat (id_obat INTEGER, jumlah_stok INTEGER);
    CREATE INDEX observasi_terbaru ON observasi (id_antrean, waktu_observasi, id_observasi);
    CREATE INDEX diagnosis_terbaru ON diagnosis (id_antrean, id_diagnosis);
    CREATE INDEX resep_terbaru ON e_resep (id_diagnosis, id_e_resep);
    INSERT INTO stok_obat VALUES (1, 4);
""")
for patient_id in range(1, 51):
    db.execute("INSERT INTO antrean VALUES (?)", (patient_id,))
    db.execute("INSERT INTO observasi VALUES (?, ?, 1)", (patient_id, patient_id))
    db.execute("INSERT INTO diagnosis VALUES (?, ?)", (patient_id, patient_id))
    db.execute("INSERT INTO e_resep VALUES (?, ?, 'terkirim')", (patient_id, patient_id))
    db.executemany("INSERT INTO detail_e_resep VALUES (?, 1, 2)", [(patient_id,), (patient_id,)])

selects = []


def record_select(statement):
    if statement.lstrip().upper().startswith("SELECT"):
        selects.append(statement)


def count_and_reset():
    count = len(selects)
    selects.clear()
    return count


db.set_trace_callback(record_select)
original_rows = []
for (queue_id,) in db.execute("SELECT id_antrean FROM antrean ORDER BY id_antrean").fetchall():
    observation = db.execute(
        "SELECT id_observasi FROM observasi WHERE id_antrean = ? ORDER BY waktu_observasi DESC LIMIT 1",
        (queue_id,),
    ).fetchone()[0]
    diagnosis = db.execute(
        "SELECT id_diagnosis FROM diagnosis WHERE id_antrean = ? ORDER BY id_diagnosis DESC LIMIT 1",
        (queue_id,),
    ).fetchone()[0]
    status = db.execute(
        "SELECT status_e_resep FROM e_resep WHERE id_diagnosis = ? ORDER BY id_e_resep DESC LIMIT 1",
        (diagnosis,),
    ).fetchone()[0]
    original_rows.append((queue_id, observation, diagnosis, status))
original_count = count_and_reset()
# Kondisi untuk memilih rekaman terbaru berasal langsung dari metode pada proyek revisi.
queue_query = f"""
    SELECT a.id_antrean, o.id_observasi, dg.id_diagnosis, e.status_e_resep FROM antrean a
    LEFT JOIN observasi o ON o.id_antrean = a.id_antrean AND {latest_joins[0]}
    LEFT JOIN diagnosis dg ON dg.id_antrean = a.id_antrean AND {latest_joins[1]}
    LEFT JOIN e_resep e ON e.id_diagnosis = dg.id_diagnosis AND {latest_joins[2]}
    ORDER BY a.id_antrean
"""
assert db.execute(queue_query).fetchall() == original_rows
print(f"Antrean 50 pasien: {original_count} SELECT menjadi {count_and_reset()} SELECT. Data contoh sesuai.")

all_prescriptions = db.execute("SELECT id_e_resep FROM e_resep ORDER BY id_e_resep DESC").fetchall()
for (prescription_id,) in all_prescriptions:
    db.execute(
        "SELECT * FROM detail_e_resep d LEFT JOIN stok_obat s USING(id_obat) WHERE id_e_resep = ?",
        (prescription_id,),
    ).fetchall()
original_count = count_and_reset()
total = db.execute("SELECT count(*) FROM e_resep").fetchone()[0]
page = [row[0] for row in db.execute("SELECT id_e_resep FROM e_resep ORDER BY id_e_resep DESC LIMIT 12")]
parameters = ",".join("?" for prescription_id in page)
stock = db.execute(
    f"""SELECT d.id_e_resep, sum(d.jumlah_obat), coalesce(s.jumlah_stok, 0)
        FROM detail_e_resep d LEFT JOIN stok_obat s ON s.id_obat = d.id_obat
        WHERE d.id_e_resep IN ({parameters})
        GROUP BY d.id_e_resep, d.id_obat, s.jumlah_stok""",
    page,
).fetchall()
by_status = db.execute("SELECT status_e_resep, count(*) FROM e_resep GROUP BY status_e_resep").fetchall()
assert total == 50 and by_status == [("terkirim", 50)]
assert len(stock) == 12 and all(required == available == 4 for _, required, available in stock)
print(f"Farmasi 50 resep: {original_count} SELECT menjadi {count_and_reset()} untuk halaman 12 resep dan ringkasan.")

db.execute("INSERT INTO observasi VALUES (800, 1, 1)")
db.execute("INSERT INTO antrean VALUES (51)")
latest = db.execute(queue_query).fetchall()
assert latest[0][1] == 800 and latest[-1] == (51, None, None, None)
db.close()
print("Waktu observasi seri dan hasil join kosong sesuai. Uji ini tidak mengukur waktu PHP, MariaDB, atau browser.")
