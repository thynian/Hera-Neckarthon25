

## Logo durch Text-Kürzel "EAM" ersetzen

### Änderungen

**1. `src/components/Navigation.tsx`**
- Import von `heraLogo` entfernen
- Das `<img>` Tag durch den Text **"EAM"** ersetzen
- Der Text "HERA" neben dem Logo wird ebenfalls zu "EAM" geändert
- Styling: Fettgedruckt, passende Schriftgröße, gleiche Farben wie bisher

Vorher:
```
<img src={heraLogo} alt="HERA Logo" className="h-8 w-8" />
<span className="text-base">HERA</span>
```

Nachher:
```
<span className="text-xl font-bold tracking-tight">EAM</span>
```

**2. `index.html`**
- Titel von "HERA - Dokumentationsverwaltung" zu "EAM - Dokumentationsverwaltung" ändern
- Open Graph und Twitter Meta-Tags entsprechend anpassen

### Technische Details

- Die Datei `src/assets/hera-logo.png` bleibt bestehen (wird nur nicht mehr importiert), kann aber bei Bedarf später entfernt werden
- Keine weiteren Dateien betroffen

