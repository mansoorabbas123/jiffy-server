import formidable from 'formidable'
import cryptoJS from 'crypto-js';
import initModels from "../../models/init-models.js";
import sequelize from '../../models/index.js';
import Jimp from 'jimp';
const model = initModels(sequelize);
// ***************************************************************
// Middleware to attach files and field to form data requests
// To Parse Form Data
// ***************************************************************

const attachBodyAndFiles = (req, res, next) => {
    console.log("Attach File Function Called")
    let form = new formidable.IncomingForm()

    form.parse(req, function (err, fields, files) {
        if (err) {
            return res.status(500).json({
                success: false,
                msg: "General Middleware File Handling Error",
                err
            })
        }

        req.files = []
        for (const key in files) {
            if (files.hasOwnProperty(key)) {
                const element = files[key]
                req.files.push(element)
            }
        }
        req.body = fields
        next()
    })
}

const tokenDecrypt = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.length) {
            let error = new Error();
            error.message = "Unauthorized";
            error.name = "notfound"
            error.status = 401;
            throw error
        }
        let token = req.headers.authorization.slice(7);
        token = await decryptData(token).catch((e) => { })
        req.headers.authorization = 'Bearer ' + token;
        next()
    }
    catch (e) { next(e) }

}

// *************
// Check if Admin
// *************

const searchUser = async (req, res, next) => {
    try {
        let user = await model.User.findOne({ where: { email: req.user.email } });
        if (!user) {
            let error = new Error();
            error.name = "permission";
            error.message = "Cannot access this route";
            error.status = 403;
            throw error;
        }
        next()
    } catch (e) {
        next(e)
    }
}

const waterMark = async (input) => {
    return new Promise(async function (resolve, reject) {
        try {
            let watermark = await Jimp.read(input.waterMarkImage);

            const image = await Jimp.read(process.env.imagePath + input.filename);

            watermark = watermark.resize(300, 200);

            let width = image.bitmap.width / 2 - 150;
            let height = image.bitmap.height / 2 - 100;

            image.composite(watermark, width, height, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacityDest: 1,
                opacitySource: 0.5
            })

            await image.writeAsync(process.env.imagePath + input.filename);
            resolve()
        } catch (e) {
            reject(e)
        }
    });
}

// *************
// Encrypt
// *************

const encryptData = async (value) => {
    return new Promise(function (resolve, reject) {
        try {
            let data = cryptoJS.AES.encrypt(value, process.env.CRYPTO).toString();
            if (!data) throw "Cannot Encrypt Data"
            resolve(data)
        } catch (e) {
            reject(e)
        }
    })
}

// *************
// Decrypt
// *************

const decryptData = async (value) => {
    return new Promise(function (resolve, reject) {
        try {
            let bytes = cryptoJS.AES.decrypt(value, process.env.CRYPTO);
            if (!bytes) throw `Cannot Decrypt Value '${value}'`;
            let originalText = bytes.toString(cryptoJS.enc.Utf8);
            if (!originalText) throw `Cannot Decrypt Value '${value}'`;
            resolve(originalText)
        } catch (e) {
            reject(e)
        }
    })
}
export default {
    attachBodyAndFiles,
    encryptData,
    decryptData,
    tokenDecrypt,
    searchUser,
    waterMark
}