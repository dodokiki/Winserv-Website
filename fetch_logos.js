const fs = require('fs');
const https = require('https');

if (!fs.existsSync('./logos')) fs.mkdirSync('./logos');

const download = (url, dest) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let redirect = res.headers.location;
            if (redirect.startsWith('/')) {
                const urlObj = new URL(url);
                redirect = urlObj.origin + redirect;
            }
            download(redirect, dest);
            return;
        }
        res.pipe(fs.createWriteStream(dest));
    }).on('error', err => console.log('Error downloading ' + dest + ':', err));
};

// Downloading the SVGs / PNGs
download('https://upload.wikimedia.org/wikipedia/commons/e/e0/LH_Financial_Group.svg', './logos/lh.svg');
download('https://upload.wikimedia.org/wikipedia/commons/1/1a/Logo_of_Sansiri_%28en%29.svg', './logos/sansiri.svg');
download('https://upload.wikimedia.org/wikipedia/commons/6/6f/Property_Perfect_Logo.svg', './logos/pf.svg');
download('https://upload.wikimedia.org/wikipedia/commons/4/4e/Tostem_logo.svg', './logos/tostem.svg');
download('https://logo.clearbit.com/windsor.co.th', './logos/windsor.png');
download('https://logo.clearbit.com/amigodoc.com', './logos/amigo.png');
