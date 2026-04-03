import ContentConfig from '../../models/web/ContentConfig.js';

// @desc    Lấy danh sách cấu hình (Topic, Product Type...)
// @route   GET /api/config?type=topic  
// @route   GET /api/config?type=product_type  
export const getConfigs = async (req, res) => {
  try {
    const { type } = req.query; 
    let filter = {};
    if (type) {
        filter.category = type;
    } else {
        filter.category = 'topic'; 
    }

    // 3. Truy vấn Database
    const configs = await ContentConfig.find(filter)
      .select('name description') 
      .sort({ name: 1 });        

    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server: " + error.message });
  }
};
