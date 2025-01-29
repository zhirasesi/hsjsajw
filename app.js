const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const generateQRIS = require('./generateQRIS');
const { createQRIS } = require('./qris');

const app = express();
const PORT = 3000;
const zhiraAuth = 'ZhiraHosting';

app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/orkut/createpayment', async (req, res) => {
    const { amount, codeqr } = req.query;
    
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
            author: zhiraAuth,
            data: qrisData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating QRIS',
            error: error.message
        });
    }
});

app.get('/orkut/checkpayment', async (req, res) => {
	const { merchant, token } = req.query;
	
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
