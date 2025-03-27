const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const generateQRIS = require('./generateQRIS');
const { createQRIS } = require('./qris');

const app = express();
const PORT = 3000;
const zhiraAuthor = 'ZhiraHosting'

app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Key untuk user
const validApiKeys = [
	'zhirahosting',
	'ahmad'
];

// Catatan apikey
const zhiraCatatan = [
	{name: 'ahmad', createdAt: '27-03-2026'}
];

// API key admin untuk mengakses rute /apikeys
const adminApiKey = 'zhirahosting05';

// Result jika apikey salah
const zhiraHost = [
	{author: zhiraAuthor, message: 'Buy Apikey 10k/bulan Free Req Username, Unlimited Request. Chat WhatsApp ZhiraHosting : 0881012303956'}
];

// Middleware untuk memeriksa otorisasi admin
const adminMiddleware = (req, res, next) => {
    const { password } = req.query;

    if (!password || password !== adminApiKey) {
        return res.status(403).json({ Error: 'Mau Ngapain Bro?😂' });
    }

    next();
};

// Endpoint untuk mengakses semua apikey
app.get('/apikeys', adminMiddleware, (req, res) => {
    res.json({ status: true, author: zhiraAuthor, apiKeys: validApiKeys, datapembelian: zhiraCatatan});
});

app.get('/orkut/createpayment', async (req, res) => {
    const { apikey, amount, codeqr } = req.query;
	
    if (!apikey || !validApiKeys.includes(apikey)) {
    return res.json(zhiraHost)
    }
	
    if (!amount) {
    return res.json("Isi Parameter Amount")
    }
    
    if (!codeqr) {
    return res.json("Isi Parameter codeqr")
    }
    try {
        const qrisData = await createQRIS(amount, codeqr);
        res.json({
            success: true,
	    author: zhiraAuthor,
            data: qrisData
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error generating QRIS',
            error: error.message
        });
    }
});

app.get('/orkut/checkpayment', async (req, res) => {
	const {apikey, merchant, token } = req.query;

	if (!apikey || !validApiKeys.includes(apikey)) {
        return res.json(zhiraHost)
        }
	
        if (!merchant) {
        return res.json("Isi Parameter Merchant.");
        }
   
        if (!token) {
        return res.json("Isi Parameter Token menggunakan token kalian.")
       }
   try {
        const apiUrl = `https://gateway.okeconnect.com/api/mutasi/qris/${merchant}/${token}`;
        const response = await axios.get(apiUrl);
        const result = response.data;
        const latestTransaction = result.data[0];
        res.json(latestTransaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server berjalan pada http://localhost:${PORT}`);
});
