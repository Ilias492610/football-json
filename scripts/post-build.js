const fs = require('fs');
const path = require('path');

// Functie om een map te kopiëren
function copyDir(src, dest) {
    // Maak de doelmap aan als deze nog niet bestaat
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Lees de inhoud van de bronmap
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // Recursief kopiëren voor submappen
            copyDir(srcPath, destPath);
        } else {
            // Kopieer bestanden
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Maak de dist/src map aan en maak het app.js bestand
const distSrcDir = path.join(__dirname, '../dist/src');
if (!fs.existsSync(distSrcDir)) {
    fs.mkdirSync(distSrcDir, { recursive: true });
}

// Schrijf het app.js bestand dat naar index.js verwijst
fs.writeFileSync(
    path.join(distSrcDir, 'app.js'),
    'require(\'../index.js\');'
);

// Kopieer de views map
const viewsSrc = path.join(__dirname, '../views');
const viewsDest = path.join(__dirname, '../dist/views');
if (fs.existsSync(viewsSrc)) {
    copyDir(viewsSrc, viewsDest);
    console.log('Views map gekopieerd naar dist/views');
} else {
    console.error('Views map niet gevonden!');
}

// Kopieer de public map
const publicSrc = path.join(__dirname, '../public');
const publicDest = path.join(__dirname, '../dist/public');
if (fs.existsSync(publicSrc)) {
    copyDir(publicSrc, publicDest);
    console.log('Public map gekopieerd naar dist/public');
} else {
    console.error('Public map niet gevonden!');
}

console.log('Post-build script voltooid!');
