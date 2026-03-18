const fs = require('fs');
const https = require('https');

const outDir = './assets/logos';
fs.mkdirSync(outDir, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const downloadOnce = (url, dest) =>
    new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirect = res.headers.location;
                if (redirect.startsWith('/')) {
                    const urlObj = new URL(url);
                    redirect = urlObj.origin + redirect;
                }
                res.resume();
                resolve({ redirect });
                return;
            }

            if (res.statusCode !== 200) {
                const statusCode = res.statusCode;
                const retryAfter = Number(res.headers['retry-after'] ?? '0');
                res.resume();
                reject({ statusCode, retryAfter });
                return;
            }

            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve({ ok: true })));
            file.on('error', (err) => reject({ error: err }));
        }).on('error', (err) => reject({ error: err }));
    });

const downloadWithRetry = async (url, dest, { retries = 4 } = {}) => {
    let current = url;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const result = await downloadOnce(current, dest);
            if (result?.redirect) {
                current = result.redirect;
                attempt--;
                continue;
            }
            console.log(`OK ${dest}`);
            return;
        } catch (e) {
            const status = e?.statusCode;
            const retryAfter = e?.retryAfter ?? 0;
            const canRetry = attempt < retries && (status === 429 || (status >= 500 && status <= 599));
            console.log(`Failed ${status ?? ''} downloading ${current} -> ${dest}`);
            if (!canRetry) return;
            const waitMs = Math.max(1000, retryAfter * 1000, 1000 * (attempt + 1) * 2);
            await sleep(waitMs);
        }
    }
};

// Downloading the SVGs / PNGs (use Special:FilePath so URLs stay stable)
const jobs = [
    {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/LH%20Financial%20Group.svg',
        dest: `${outDir}/lh.svg`
    },
    {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo%20of%20Sansiri%20(en).svg',
        dest: `${outDir}/sansiri.svg`
    },
    {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Property%20Perfect%20Logo.svg',
        dest: `${outDir}/pf.svg`
    },
    {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tostem%20logo.svg',
        dest: `${outDir}/tostem.svg`
    },
    {
        // Clearbit is usually hotlink-friendly; stored locally for reliability
        url: 'https://logo.clearbit.com/windsor.co.th',
        dest: `${outDir}/windsor.png`
    },
    {
        url: 'https://logo.clearbit.com/amigothailand.com',
        dest: `${outDir}/amigo.png`
    }
];

(async () => {
    for (const job of jobs) {
        await downloadWithRetry(job.url, job.dest);
        await sleep(400);
    }
})();
