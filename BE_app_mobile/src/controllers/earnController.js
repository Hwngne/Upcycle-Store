const Article = require('../models/articleModel');
const Quiz = require('../models/quizModel');
const Earning = require('../models/earningModel'); 
const User = require('../models/userModel');
const Video = require('../models/videoModel');

const getTodayStart = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

// --- 1. LẤY DANH SÁCH BÀI BÁO  ---
const getArticles = async (req, res) => {
  try {
    const userId = req.user.id; 

    const articles = await Article.find({ visible: true })
      .select('title thumbnail content rewardPoint readingTime quiz displayType createdAt')
      .sort({ createdAt: -1 });

    const todayCount = await Earning.countDocuments({
      user: userId,
      activityType: 'article',
      createdAt: { $gte: getTodayStart() } 
    });

    res.json({
      articles: articles,
      readToday: todayCount 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. LẤY DANH SÁCH QUIZ  ---
const getQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;

    const quizzes = await Quiz.find({ visible: true })
      .select('title time_limit max_points questions rewardPoint') 
      .sort({ createdAt: -1 });

    const todayCount = await Earning.countDocuments({
      user: userId,
      activityType: 'quiz',
      createdAt: { $gte: getTodayStart() }
    });

    res.json({
      quizzes: quizzes,
      doneToday: todayCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. CLAIM ARTICLE ---
const claimArticlePoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.body;

    const article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ message: "Bài viết không tồn tại" });

    const startOfToday = getTodayStart();
    
    const existingEarn = await Earning.findOne({ 
      user: userId, 
      article: articleId,
      createdAt: { $gte: startOfToday }
    });

    if (existingEarn) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã nhận điểm bài này hôm nay rồi. Hãy quay lại vào ngày mai nhé!' 
      });
    }

    const pointsReward = article.rewardPoint || article.bonusPoints || 10;

    const user = await User.findById(userId);
    user.total_points = (user.total_points || 0) + pointsReward;
    user.totalScore = (user.totalScore || 0) + pointsReward;
    await user.save();

    await Earning.create({
      user: userId,
      activityType: 'article',
      taskName: `Đọc: ${article.title}`,
      pointsEarned: pointsReward,
      referenceCode: articleId
    });

    res.json({ 
      success: true, 
      message: `Đã nhận +${pointsReward} điểm`,
      newPoints: user.points,
      pointsEarned: pointsReward 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. CLAIM QUIZ ---
const claimQuizPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz không tồn tại" });

    const startOfToday = getTodayStart();

    const existingEarn = await Earning.findOne({ 
      user: userId, 
      quiz: quizId, 
      createdAt: { $gte: startOfToday }
    });

    if (existingEarn) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã nhận điểm bài này hôm nay rồi. Hãy quay lại vào ngày mai nhé!!' 
      });
    }

    const pointsReward = quiz.rewardPoint || quiz.max_points || quiz.bonusPoints || 20;

    const user = await User.findById(userId);
    user.total_points = (user.total_points || 0) + pointsReward;
    user.totalScore = (user.totalScore || 0) + pointsReward;
    await user.save();

    await Earning.create({
      user: userId,
      activityType: 'quiz',
      taskName: `Quiz: ${quiz.title}`,
      pointsEarned: pointsReward,
      referenceCode: quizId
    });

    res.json({ 
      success: true, 
      message: `Hoàn thành Quiz! +${pointsReward} điểm`,
      newPoints: user.total_points,
      pointsEarned: pointsReward
    });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // --- 5. LẤY DANH SÁCH VIDEO  ---
  const getVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Chỉ lấy video đang public và visible
    const videos = await Video.find({ 
      status: 'published', 
      visible: true 
    })
    .select('title description thumbnailUrl videoUrl views rewardPoint createdAt') 
    .sort({ createdAt: -1 });

    const todayStart = getTodayStart();
    const doneToday = await Earning.countDocuments({
      user: userId,
      activityType: 'video', 
      createdAt: { $gte: todayStart }
    });

    res.json({
      success: true,
      videos: videos,
      doneToday: doneToday 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 6. NHẬN THƯỞNG VIDEO ---
const claimVideoPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.body;

    const todayStart = getTodayStart();
    const countToday = await Earning.countDocuments({
        user: userId,
        activityType: 'video',
        createdAt: { $gte: todayStart }
    });

    if (countToday >= 3) {
        return res.status(400).json({ 
            success: false, 
            message: "Bạn đã đạt giới hạn xem 3 video kiếm điểm hôm nay!" 
        });
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video không tồn tại" });

    const existingEarn = await Earning.findOne({
        user: userId,
        referenceCode: videoId, 
        activityType: 'video',
        createdAt: { $gte: todayStart }
    });

    if (existingEarn) {
        return res.status(400).json({ 
            success: false, 
            message: "Bạn đã nhận điểm video này rồi." 
        });
    }

    const pointsReward = video.rewardPoint || video.bonusPoints || 15;
    const user = await User.findById(userId);
    user.total_points = (user.total_points || 0) + pointsReward;
    user.totalScore = (user.totalScore || 0) + pointsReward;
    await user.save();
    
    video.views = (video.views || 0) + 1;
    await video.save();

    await Earning.create({
      user: userId,
      activityType: 'video',
      taskName: `Xem video: ${video.title}`,
      pointsEarned: pointsReward,
      referenceCode: videoId
    });

    res.json({ 
      success: true, 
      message: `Xem xong! +${pointsReward} điểm`,
      newPoints: user.total_points,
      pointsEarned: pointsReward
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- 7. QUAY VÒNG MAY MẮN ---
const spinWheel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { points } = req.body; 

    const user = await User.findById(userId);

    // 1. Kiểm tra lại lần nữa (Security)
    if (user.lastSpinDate) {
        const today = new Date().setHours(0,0,0,0);
        const lastSpin = new Date(user.lastSpinDate).setHours(0,0,0,0);
        if (today === lastSpin) {
             return res.status(400).json({ success: false, message: "Hôm nay bạn đã quay rồi!" });
        }
    }

    // 2. Cộng điểm
    if (points > 0) {
        user.total_points = (user.total_points || 0) + points;
        user.totalScore = (user.totalScore || 0) + points; 
        
        // Lưu lịch sử Earning
        const Earning = require('../models/earningModel');
        await Earning.create({
            user: userId,
            activityType: 'other',
            taskName: 'Vòng quay may mắn',
            pointsEarned: points,
            referenceCode: `SPIN-${Date.now()}`
        });
    }

    // 3. Cập nhật ngày quay
    user.lastSpinDate = new Date();
    await user.save();

    res.json({ 
        success: true, 
        message: `Chúc mừng nhận ${points} điểm`,
        newPoints: user.total_points 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- 8. NHẬN THƯỞNG TỪ VIỆC QUÉT CAMERA AI ---
const claimAiScanPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemName, category, points } = req.body; 

    //Chống gian lận (Anti-cheat)
    // Giới hạn mỗi ngày chỉ được quét nhận điểm tối đa 5 lần
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const Earning = require('../models/earningModel');
    const scanCountToday = await Earning.countDocuments({
      user: userId,
      activityType: 'ai_scan',
      createdAt: { $gte: startOfToday }
    });

    if (scanCountToday >= 5) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đạt giới hạn quét rác nhận điểm hôm nay (5/5 lần). Hãy quay lại vào ngày mai!"
      });
    }

    // 2. Cộng điểm cho User
    const User = require('../models/userModel');
    const user = await User.findById(userId);
    
    // Đảm bảo points hợp lệ 
    const validPoints = Math.min(Number(points) || 5, 50); 

    user.total_points = (user.total_points || 0) + validPoints;
    user.totalScore = (user.totalScore || 0) + validPoints;
    await user.save();

    // 3. Lưu lịch sử
    await Earning.create({
      user: userId,
      activityType: 'ai_scan',
      taskName: `Phân loại AI: ${itemName} (${category})`,
      pointsEarned: validPoints,
      referenceCode: `AI-${Date.now()}`
    });

    res.json({
      success: true,
      message: `Quét thành công! +${validPoints} điểm`,
      newPoints: user.total_points,
      pointsEarned: validPoints
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getArticles, 
  getQuizzes, 
  claimArticlePoints, 
  claimQuizPoints, 
  getVideos, 
  claimVideoPoints,
  spinWheel,
  claimAiScanPoints 
};