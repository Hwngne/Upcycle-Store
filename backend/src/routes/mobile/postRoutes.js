import express from 'express';
import uploadCloud from '../../config/cloudinary.js'; 
import { protect } from '../../middlewares/authMiddleware.js'; 
import { 
    createPost, 
    getPosts, 
    toggleLikePost,
    commentPost,
    toggleLikeComment,
    deleteComment,
    editComment,
    replyToComment,
    toggleLikeReply,
    deleteReply,
    editReply,
    deletePost,
    markPostAsSold
} from '../../controllers/mobile/postController.js';

const router = express.Router();

// --- CÁC ROUTE ---
router.post('/', 
    protect, 
    uploadCloud.fields([
        { name: 'image', maxCount: 1 },       
        { name: 'attachment', maxCount: 1 }  
    ]), 
    createPost
);

router.post('/:id/comment', protect, uploadCloud.single('image'), commentPost);
router.post('/:id/comment/:commentId/reply', protect, uploadCloud.single('image'), replyToComment);

router.get('/', getPosts);
router.put('/:id/like', protect, toggleLikePost);
router.put('/:id/comment/:commentId/like', protect, toggleLikeComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.put('/:id/comment/:commentId', protect, editComment);
router.put('/:id/comment/:commentId/reply/:replyId/like', protect, toggleLikeReply);
router.delete('/:id/comment/:commentId/reply/:replyId', protect, deleteReply);
router.put('/:id/comment/:commentId/reply/:replyId', protect, editReply);
router.delete('/:id', protect, deletePost);
router.put('/:id/sold', protect, markPostAsSold);

export default router;