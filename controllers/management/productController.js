/**
 * Product Management Controller
 * Handles product CRUD operations and image uploads
 */

const db = require('../../module/database/db');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const functions = require('../../functions');
const clientEvents = require('../../routes/router_client_events');

/**
 * Get all products
 * GET /manage/getProducts/
 */
async function getAllProducts(req, res, next) {
    try {
        const listFromDb = await db.dbGetProductsAll();
        res.send(listFromDb);
    } catch (error) {
        next(error);
    }
}

/**
 * Insert new product
 * POST /manage/insertProduct/:data
 */
async function insertProduct(req, res, next) {
    try {
        const newItem = JSON.parse(req.params.data);
        console.log("APP: ADD NEW PRODUCTS: " + newItem);
        
        const response = await db.dbInsertProduct(newItem);
        
        // Notify clients of product change
        clientEvents.sendEvents("reloadItems");
        
        res.send(response);
    } catch (error) {
        next(error);
    }
}

/**
 * Edit product
 * POST /manage/editProduct/:data
 */
async function editProduct(req, res, next) {
    try {
        const newData = req.params.data;
        const newArray = newData.split(',');
        console.log("APP: EDIT PRODUCT" + newArray);
        
        const response = await db.dbEditProduct(newArray);
        
        // Notify clients of product change
        clientEvents.sendEvents("reloadItems");
        
        res.send(response);
    } catch (error) {
        next(error);
    }
}

/**
 * Delete product
 * POST /manage/deleteProduct/:data
 */
async function deleteProduct(req, res, next) {
    try {
        const productID = JSON.parse(req.params.data);
        console.log("APP: DELETE PRODUCT: " + productID);
        
        const response = await db.dbDeleteProduct(productID);
        
        // Notify clients of product change
        clientEvents.sendEvents("reloadItems");
        
        res.send(response);
    } catch (error) {
        next(error);
    }
}

/**
 * Get item images list
 * GET /manage/getItemImgs
 */
async function getItemImages(req, res, next) {
    try {
        const itemImgArray = functions.itemImgArray();
        const getItemImgs = require("../../module/html/elements/manageGetItemImg.js");
        const html = getItemImgs.buildHtml(itemImgArray);
        res.send(html);
    } catch (error) {
        next(error);
    }
}

/**
 * Upload product image
 * POST /manage/uploadItemImg
 */
async function uploadItemImage(req, res, next) {
    try {
        const maxFileSize = 70 * 1024 * 1024; // 70MB
        const options = {
            uploadDir: path.join(__dirname, '../../public/img/items/'),
            maxFileSize: maxFileSize,
            keepExtensions: true,
            filter: function ({ name, originalFilename, mimetype }) {
                return mimetype && mimetype.includes("image");
            }
        };
        
        const form = formidable(options);
        
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err);
                return res.status(500).send('Upload failed');
            }
            
            const newName = files.img.filepath;
            let originalName = path.join(__dirname, '../../public/img/items/', files.img.originalFilename);
            
            // Rename file if it exists
            originalName = renameFileIfExist(originalName);
            
            fs.rename(newName, originalName, function(err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send('File rename failed');
                }
                res.redirect('/manage');
            });
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Helper: Rename file if it already exists
 * @param {string} file - File path
 * @returns {string} New file path
 */
function renameFileIfExist(file) {
    if (fs.existsSync(file)) {
        console.log("File exists, renaming...");
        const fileNameDir = path.parse(file).dir;
        const fileNameBase = path.parse(file).name;
        const fileNameExt = path.parse(file).ext;
        const currentTime = Date.now();
        return fileNameDir + "/" + fileNameBase + currentTime + fileNameExt;
    } else {
        return file;
    }
}

module.exports = {
    getAllProducts,
    insertProduct,
    editProduct,
    deleteProduct,
    getItemImages,
    uploadItemImage
};
