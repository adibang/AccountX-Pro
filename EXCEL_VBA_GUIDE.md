# Panduan Membangun Aplikasi Akuntansi Excel Pro (VBA)

Jika Anda ingin memindahkan logika aplikasi ini ke Excel, ikuti langkah-langkah berikut:

## 1. Struktur Sheet
Buat sheet dengan nama berikut:
- **Menu**: Dashboard utama dengan tombol navigasi.
- **COA**: Tabel Chart of Accounts (Kolom: Kode, Nama Akun, Tipe, Saldo Awal, Saldo Akhir).
- **Jurnal**: Database seluruh transaksi (Kolom: Tanggal, Ref, Keterangan, Akun, Debit, Kredit).
- **BukuBesar**: Filter otomatis per akun.
- **LapLabaRugi**: Format laporan laba rugi.
- **Neraca**: Format laporan neraca staffel.

## 2. Kode VBA Dasar (Posting Jurnal)
Buka VBA Editor (Alt+F11), Insert Module, lalu paste kode berikut:

```vba
Sub PostJournal(dateVal As Date, refVal As String, descVal As String, accCode As String, debitVal As Double, creditVal As Double)
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Jurnal")
    
    Dim nextRow As Long
    nextRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
    
    ws.Cells(nextRow, 1).Value = dateVal
    ws.Cells(nextRow, 2).Value = refVal
    ws.Cells(nextRow, 3).Value = descVal
    ws.Cells(nextRow, 4).Value = accCode
    ws.Cells(nextRow, 5).Value = debitVal
    ws.Cells(nextRow, 6).Value = creditVal
    
    MsgBox "Jurnal Berhasil Diposting!", vbInformation
End Sub
```

## 3. Rumus Penting (Non-VBA)
Di Sheet COA, untuk mendapatkan Saldo Akhir:
`=SaldoAwal + SUMIFS(Jurnal!E:E, Jurnal!D:D, KodeAkun) - SUMIFS(Jurnal!F:F, Jurnal!D:D, KodeAkun)`
*(Gunakan logika terbalik untuk Kewajiban/Ekuitas)*

## 4. Keamanan
- Gunakan `Sheet.Protect "password"` di event `Workbook_Open`.
- Sembunyikan database dengan `Sheets("Jurnal").Visible = xlSheetVeryHidden`.

---
Gunakan aplikasi web AccounX Pro yang telah saya bangun di preview untuk pengalaman yang lebih modern, kolaboratif, dan aman.
