import Message from "../models/MessagesModel.js";
import fs from "fs";
import path, { format } from "path";
import cloudinary from '../config/cloudinaryConfig.js';

export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;
    if (!user1 || !user2) {
      return res.status(400).send("Both user IDs are required.");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

// export const uploadFile = async (request, response, next) => {
//   try {
//     if (!request.file) {
//       return response.status(404).send("File is required.");
//     }
//     console.log("in try if");
//     const date = Date.now();
//     let fileDir = `uploads/files/${date}`;
//     let fileName = `${fileDir}/${request.file.originalname}`;

//     // Create directory if it doesn't exist
//     mkdirSync(fileDir, { recursive: true });

//     renameSync(request.file.path, fileName);
//     return response.status(200).json({ filePath: fileName });


//   } catch (error) {
//     console.log({ error });
//     return response.status(500).send("Internal Server Error.");
//   }
// };


export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return response.status(404).send("File is required.");
    }
    // console.log("in try if");
    // const date = Date.now();
    // let fileDir = `uploads/files/${date}`;
    // let fileName = `${req.file.originalname}-${date}`;
    function generatePublicId(originalname) {
      const timestamp = Date.now();
      const name = path.parse(originalname).name;
      return `user_uploads/${name}-${timestamp}`;
    }
    // // Create directory if it doesn't exist
    // mkdirSync(fileDir, { recursive: true });
    
    // renameSync(request.file.path, fileName);
    
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).slice(1)
    console.log(fileExt)
    const publicId = generatePublicId(req.file.originalname);
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      public_id: publicId,
      format: fileExt,
      // overwrite:false,
    });
    console.log("file uploaded", result.url,result.format)
    fs.unlinkSync(filePath);
    return res.status(200).json({ filePath: result.url, originalName: req.file.originalname });


  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error.");
  }
};

