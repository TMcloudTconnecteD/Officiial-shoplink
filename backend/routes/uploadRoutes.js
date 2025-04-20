import express from 'express';
import multer from 'multer';
import path, { extname } from 'path';


const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')

    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${Date.now()}${extname}`)
    }


})

const fileFilter = (req, file, cb) => {
    const filetypes = /jpe?g|jpg|png|gif/;
    const mimetypes = /image\/jpe?g|image\/jpg|image\/png|image\/gif|image\/webp/;

    const fileExt = path.extname(file.originalname).toLowerCase();
    const extnameValid = filetypes.test(fileExt);
    const mimetypeValid = mimetypes.test(file.mimetype);

    if (extnameValid && mimetypeValid) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG, JPG, PNG and GIF are allowed!'), false);
    }
};


    const upload = multer({
        storage: storage,
        limits: { fileSize: 1000000 },
        fileFilter
    })
    const uploadSingleImage = upload.single('image')


router.post('/', (req, res ) => {
   
uploadSingleImage(req, res, (err) => {
        if (err) {
            res.status(400).send({ message: err.message })
        }
        else if (req.file) {
        res.status(200).send({ message: 'Image uploaded successfully', 
            image: `/${req.file.path}` 
        })
        }
        else {
            res.status(400).send({ message: 'Please select an image to upload' })
        }

    
    })

})

export default router;