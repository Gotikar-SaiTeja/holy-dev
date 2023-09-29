import {videoByIDPlay} from "@/controllers/video.controller";
import express from "express";
import multer from "multer";
import {uploadVideo} from "@/controllers/video.controller";
//import { Youtube } from "@/controllers/video.controller";
const router = express.Router();

const storage = multer.memoryStorage();
const uploadvideo = multer({ storage });



router.post("/uploadvideo", uploadvideo.single("file") ,uploadVideo);

router.get('/videoplay/:id',videoByIDPlay)
 
import { convertVideoToMP3 } from '@/controllers/video.controller';
 
router.post('/convert', convertVideoToMP3);


export default router;