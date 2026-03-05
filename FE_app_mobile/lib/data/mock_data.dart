// Mẫu chuẩn (Model) cho Tin tức
class NewsItem {
  final int id;
  final String title;
  final String desc;
  final String image;
  final String content; // Thêm cái này để chứa nội dung dài cho trang chi tiết
  final DateTime? date;
  final List<QuizQuestion> question; // Thêm câu hỏi quiz (nếu có)

  // Constructor chuẩn
  NewsItem({
    required this.id,
    required this.title,
    required this.desc,
    required this.image,
    this.content = "", // Mặc định rỗng nếu chưa có
    this.date,
    this.question = const [],
  });
}

// Mẫu chuẩn cho User
class UserData {
  static String name = "Nguyễn Ngọc Trâm";
  static String email = "tram@gmail.com";
  static String id = "123";
  static String role = "Sinh Viên";
  static String avatar = "https://i.pravatar.cc/150?u=tram";
  static int points = 0;
  static int rank = 0;
  static String gender = "Nam";
  static String phone = "";
  static String dateOfBirth = "";
  static int videosWatchedToday = 0;

  // Lịch sử điểm danh
  static List<String> attendanceHistory = [];

  static int unreadMessages = 2; // Số tin nhắn chưa đọc

  // 2. Đếm số lượt đã làm trong ngày
  static int articlesReadToday = 0;
  static int quizzesDoneToday = 0;
  static bool hasSpunWheelToday = false; // Quay vòng chưa
}

// Dữ liệu giả (Mock List)
final List<NewsItem> newsData = [
  NewsItem(
    id: 1,
    title: "Hậu quả của nóng lên toàn cầu",
    desc: "Lorem Ipsum is simply dummy text...",
    content: "Đây là nội dung rất dài của bài viết số 1...",
    image:
        "https://img.freepik.com/free-photo/global-warming-concept-with-dry-earth_23-2150035046.jpg",
    date: DateTime(2025, 10, 15),
    question: [
      QuizQuestion(
        question: "Nóng lên toàn cầu gây ra hiện tượng gì?",
        options: ["Băng tan", "Nước biển giảm", "Cây xanh tốt", "Không có gì"],
        correctAnswerIndex: 0,
      ),
      QuizQuestion(
        question: "Khí nào gây hiệu ứng nhà kính chính?",
        options: ["Oxy", "Nitơ", "CO2", "Hydro"],
        correctAnswerIndex: 2,
      ),
      QuizQuestion(
        question: "Hành động nào giúp giảm nóng lên toàn cầu?",
        options: ["Đốt rác", "Trồng cây", "Chặt phá rừng", "Xả khí thải"],
        correctAnswerIndex: 1,
      ),
      QuizQuestion(
        question: "Băng tan ảnh hưởng gì đến mực nước biển?",
        options: ["Giữ nguyên", "Giảm xuống", "Dâng cao", "Đóng băng"],
        correctAnswerIndex: 2,
      ),
      QuizQuestion(
        question: "Ngày Trái Đất là ngày nào?",
        options: ["22/04", "01/01", "02/09", "25/12"],
        correctAnswerIndex: 0,
      ),
    ],
  ),
  NewsItem(
    id: 2,
    title: "Hướng dẫn phân loại rác thải",
    desc: "Cách phân loại rác hữu cơ và vô cơ...",
    content: "Chi tiết cách phân loại rác...",
    image:
        "https://img.freepik.com/free-vector/garbage-sorting-concept-illustration_114360-5238.jpg",
  ),
  NewsItem(
    id: 3,
    title: "Tái chế nhựa đúng cách",
    desc: "Những điều bạn cần biết khi tái chế...",
    content: "Quy trình tái chế nhựa...",
    image:
        "https://img.freepik.com/free-vector/people-recycling-concept-illustration_114360-1650.jpg",
  ),
];

// Mẫu chuẩn cho Câu hỏi Quiz
class QuizQuestion {
  final String question;
  final List<String> options;
  final int correctAnswerIndex;

  QuizQuestion({
    required this.question,
    required this.options,
    required this.correctAnswerIndex,
  });
}

// 1. Model cho Trạm thu gom
class WasteStation {
  final String name; // Tên trạm
  final String type; // Loại rác tiếp nhận
  final String area; // Khu vực
  final String address; // Địa chỉ chi tiết
  final String contact; // Liên hệ (SĐT/Người quản lý)

  WasteStation({
    required this.name,
    required this.type,
    required this.area,
    required this.address,
    required this.contact,
  });
}

// 2. Danh sách các Loại rác (Theo yêu cầu của bạn)
final List<String> wasteTypesList = [
  "Chai/ ly nhựa PET",
  "Chai/ lon kim loại",
  "Giấy sạch (giấy văn phòng, báo tạp chí, sách vở, catalogue,...) và carton",
  "CTR còn lại",
  "Chất thải thực phẩm dạng rắn",
  "Chất thải thực phẩm dạng lỏng",
];

// 3. Danh sách Khu vực (Giả định trong trường)
final List<String> areaList = [
  "Khu Giảng đường A",
  "Khu Giảng đường B",
  "Canteen trung tâm",
  "Thư viện",
  "Ký túc xá",
  "Sân vận động",
];

// 4. Dữ liệu mẫu các trạm đang có
final List<WasteStation> stationData = [
  WasteStation(
    name: "Trạm Eco 01 - Canteen",
    type: "Chất thải thực phẩm dạng rắn",
    area: "Canteen trung tâm",
    address: "Cạnh bồn rửa tay khu Canteen",
    contact: "Cô Lao Công (090xxx)",
  ),
  WasteStation(
    name: "Trạm Eco 02 - Thư viện",
    type:
        "Giấy sạch (giấy văn phòng, báo tạp chí, sách vở, catalogue,...) và carton",
    area: "Thư viện",
    address: "Sảnh chính thư viện tầng 1",
    contact: "Thầy Quản thư",
  ),
  WasteStation(
    name: "Trạm Eco 03 - Sảnh A",
    type: "Chai/ ly nhựa PET",
    area: "Khu Giảng đường A",
    address: "Dưới chân cầu thang bộ A1",
    contact: "Bảo vệ toà A",
  ),
  WasteStation(
    name: "Trạm Eco 04 - KTX",
    type: "CTR còn lại",
    area: "Ký túc xá",
    address: "Cổng sau KTX khu B",
    contact: "Ban quản lý KTX",
  ),
];

// 5. Model cho Bài viết diễn đàn

class ForumPost {
  final String id;
  final String authorName;
  final String authorAvatar;
  final String time;
  final DateTime timestamp;
  final String content;
  final String? image;
  final String tagName;
  final String? topic;
  final String? category;
  final double? price;
  final String? eventStatus;
  final String? attachmentUrl;
  final String? attachmentName;

  int likes;
  int comments;
  bool isLiked; // <-nhớ trạng thái Tim)

  ForumPost({
    required this.id,
    required this.authorName,
    required this.authorAvatar,
    required this.time,
    required this.timestamp,
    required this.content,
    this.image,
    required this.tagName,
    this.topic,
    this.category,
    this.price,
    this.eventStatus,
    this.likes = 0,
    this.comments = 0,
    this.isLiked = false,
    this.attachmentUrl,
    this.attachmentName, // <-- Mặc định là chưa Tim
  });
}

// 6. Dữ liệu giả cho Diễn đàn (Khớp với thiết kế của bạn)
final List<ForumPost> forumPosts = [
  ForumPost(
    id: "post1",
    authorName: "Nguyễn Ngọc Trâm",
    authorAvatar: UserData.avatar,
    time: "1 minute",
    timestamp: DateTime(2025, 12, 22),
    tagName: "Kiến thức",
    topic: "Kiến thức", // <--- Gán chủ đề giả định
    content: "Chai nhựa có thể dùng để tái chế thành các món đồ thủ công.",
    image:
        "https://img.freepik.com/free-vector/garbage-sorting-concept-illustration_114360-5238.jpg",
    likes: 12,
    comments: 4,
  ),
  ForumPost(
    id: "post2",
    authorName: "Phan Gia Hân",
    authorAvatar: "https://i.pravatar.cc/150?u=han",
    time: "25 minutes",
    timestamp: DateTime(2025, 10, 15),
    tagName: "Sản phẩm",
    topic: "Đồ Handmade", // <--- Gán chủ đề giả định
    content:
        "Mình vừa làm xong bộ chậu cây từ vỏ chai nhựa cũ nè mọi người ơi! Nhìn xinh xỉu lun á 😍",
    image:
        "https://i.pinimg.com/736x/e8/35/66/e83566735e2632280d28589710080614.jpg",
    likes: 45,
    comments: 10,
  ),
  ForumPost(
    id: "post3",
    authorName: "Trần Văn An",
    authorAvatar: "https://i.pravatar.cc/150?u=an",
    time: "1 hour",
    timestamp: DateTime(2025, 11, 15),
    tagName: "Sản phẩm",
    category: "Dụng cụ làm vườn",
    price: 150000, // <--- Có phí (150k)
    content: "Pass lại bộ xẻng làm vườn chưa dùng lần nào.",
    image: null,
    likes: 5,
    comments: 2,
  ),
  ForumPost(
    id: "post4",
    authorName: "CLB Môi Trường",
    authorAvatar: "https://i.pravatar.cc/150?u=clb",
    time: "2 hours",
    timestamp: DateTime(2025, 12, 20),
    tagName: "Sự kiện",
    category: "Hoạt động tình nguyện", // Loại sự kiện
    eventStatus: "Sắp diễn ra", // Trạng thái
    content:
        "Chủ nhật này CLB tổ chức nhặt rác tại công viên. Đăng ký ngay nhé!",
    image:
        "https://media.istockphoto.com/id/1145183123/vector/volunteers-cleaning-park-from-garbage-vector.jpg?s=612x612&w=0&k=20&c=L_7nO4K5O9f8rQk6Z5o8z5d8k_4q6Z8v5o8z5d8k_4q6Z8v=",
    likes: 88,
    comments: 20,
  ),
];

// 7. Model cho Bình luận
class Comment {
  final String authorName;
  final String authorAvatar;
  final String content;
  final String time;

  Comment({
    required this.authorName,
    required this.authorAvatar,
    required this.content,
    required this.time,
  });
}

// 8. Dữ liệu giả: Danh sách bình luận mẫu cho các bài viết
// (Sau này Backend sẽ trả về list riêng cho từng bài, giờ ta dùng chung để test)
List<Comment> mockComments = [
  Comment(
    authorName: "Trần Văn An",
    authorAvatar: "https://i.pravatar.cc/150?u=an",
    content: "Bài viết hay quá, cảm ơn bạn đã chia sẻ!",
    time: "5 phút trước",
  ),
  Comment(
    authorName: "Châu Nhuận Phát",
    authorAvatar: "https://i.pravatar.cc/150?u=bich",
    content: "Mình cũng đang định làm cái này, xin công thức với ạ 😍",
    time: "10 phút trước",
  ),
];

// 9. Model cho Quà tặng đổi điểm
enum GiftType { drl, item } // drl: Điểm rèn luyện, item: Vật phẩm

class GiftItem {
  final String name;
  final String iconPath; // Đường dẫn ảnh hoặc icon
  final int cost; // Giá điểm
  final GiftType type;
  final String description;
  // Các thông tin cho vật phẩm (nếu có)
  final String? exchangeRate; // VD: 1000 ĐTL = 1 ĐRL

  GiftItem({
    required this.name,
    required this.iconPath,
    required this.cost,
    required this.type,
    this.description =
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    this.exchangeRate,
  });
}

// Danh sách quà giả lập
final List<GiftItem> giftList = [
  GiftItem(
    name: "Điểm rèn luyện",
    iconPath:
        "https://cdn-icons-png.flaticon.com/512/2921/2921222.png", // Icon sách vở
    cost: 1000,
    type: GiftType.drl,
    exchangeRate: "1000 Điểm = 1 ĐRL",
  ),
  GiftItem(
    name: "Cây xanh",
    iconPath:
        "https://cdn-icons-png.flaticon.com/512/628/628324.png", // Icon cây
    cost: 200,
    type: GiftType.item,
    exchangeRate: "200 Điểm = 1 Cây xanh",
  ),
  GiftItem(
    name: "Sổ tay",
    iconPath: "https://cdn-icons-png.flaticon.com/512/889/889648.png",
    cost: 300,
    type: GiftType.item,
    exchangeRate: "300 Điểm = 1 Sổ tay",
  ),
  GiftItem(
    name: "Túi vải",
    iconPath: "https://cdn-icons-png.flaticon.com/512/2662/2662503.png",
    cost: 400,
    type: GiftType.item,
    exchangeRate: "400 Điểm = 1 Túi vải",
  ),
  GiftItem(
    name: "Hạt giống",
    iconPath: "https://cdn-icons-png.flaticon.com/128/2227/2227504.png",
    cost: 150,
    type: GiftType.item,
    exchangeRate: "150 Điểm = 1 Gói hạt",
  ),
  GiftItem(
    name: "Bình giữ nhiệt",
    iconPath: "https://cdn-icons-png.flaticon.com/128/4523/4523387.png",
    cost: 1500,
    type: GiftType.item,
    exchangeRate: "1500 Điểm = 1 Bình",
  ),
  GiftItem(
    name: "Bút bi tre",
    iconPath: "https://cdn-icons-png.flaticon.com/128/2280/2280532.png",
    cost: 50,
    type: GiftType.item,
    exchangeRate: "50 Điểm = 1 Bút",
  ),
  GiftItem(
    name: "Sticker",
    iconPath: "https://cdn-icons-png.flaticon.com/512/1598/1598196.png",
    cost: 20,
    type: GiftType.item,
    exchangeRate: "20 Điểm = 1 Bộ sticker",
  ),
];

// 10. Model cho Lịch sử giao dịch
enum TransactionStatus { completed, pending, cancelled }

class TransactionItem {
  final String id; // Mã giao dịch (VD: IT1011202501)
  final String itemName; // Tên món (Bình giữ nhiệt / Sách cũ...)
  final DateTime date; // Ngày giao dịch
  final String role; // Bên mua / Bên bán / Đổi quà
  final String price; // "Miễn phí", "2500 Điểm", "50.000 đ"
  final TransactionStatus status; // Trạng thái

  TransactionItem({
    required this.id,
    required this.itemName,
    required this.date,
    required this.role,
    required this.price,
    required this.status,
  });
}

// Dữ liệu giả lập
final List<TransactionItem> transactionHistory = [
  // 1. Giao dịch đổi quà (Từ trang Đổi điểm)
  TransactionItem(
    id: "GIFT20251015",
    itemName: "Bình giữ nhiệt",
    date: DateTime(2025, 10, 15),
    role: "Đổi quà",
    price: "1500 Điểm",
    status: TransactionStatus.completed,
  ),
  // 2. Giao dịch mua trên diễn đàn
  TransactionItem(
    id: "IT1011202501",
    itemName: "Giáo trình C++ cũ",
    date: DateTime(2025, 11, 10),
    role: "Bên mua",
    price: "30.000 đ",
    status: TransactionStatus.completed,
  ),
  // 3. Giao dịch bán (đang chờ)
  TransactionItem(
    id: "IT1011202502",
    itemName: "Vỏ chai nhựa (5kg)",
    date: DateTime(2025, 12, 20), // Ngày gần đây
    role: "Bên bán",
    price: "Miễn phí",
    status: TransactionStatus.pending,
  ),
  TransactionItem(
    id: "GIFT20251201",
    itemName: "Cây sen đá",
    date: DateTime(2025, 12, 01),
    role: "Đổi quà",
    price: "200 Điểm",
    status: TransactionStatus.completed,
  ),
];

// --- DATA CHO TÍNH NĂNG CHAT ---

class ChatMessage {
  final String messageContent;
  final String
  messageType; // "sender" (mình gửi) hoặc "receiver" (người ta gửi)
  final DateTime timestamp;

  ChatMessage({
    required this.messageContent,
    required this.messageType,
    required this.timestamp,
  });
}

class ChatUser {
  final String id;
  final String name;
  final String messageText;
  final String image;
  final String time;
  final bool isOnline; // Trạng thái online

  ChatUser({
    required this.id,
    required this.name,
    required this.messageText,
    required this.image,
    required this.time,
    this.isOnline = false,
  });
}

// Danh sách tin nhắn giả lập của 1 cuộc hội thoại cụ thể
// (Sau này sẽ load từ database theo ID người dùng)
List<ChatMessage> mockMessages = [
  ChatMessage(
    messageContent: "Chào bạn, món đồ này còn không?",
    messageType: "sender",
    timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
  ),
  ChatMessage(
    messageContent: "Chào bạn, vẫn còn nhé!",
    messageType: "receiver",
    timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
  ),
  ChatMessage(
    messageContent: "Bạn có thể fix giá chút được không?",
    messageType: "sender",
    timestamp: DateTime.now().subtract(const Duration(minutes: 3)),
  ),
  ChatMessage(
    messageContent: "Mình bớt 10k tiền xăng xe cho sinh viên nha ^^",
    messageType: "receiver",
    timestamp: DateTime.now().subtract(const Duration(minutes: 1)),
  ),
];

// Danh sách các cuộc hội thoại (Danh sách bạn bè)
List<ChatUser> chatUsers = [
  ChatUser(
    id: "65bf1234567890abcdef1234",
    name: "Trần Văn A",
    messageText: "Mình bớt 10k tiền xăng xe...",
    image: "https://i.pravatar.cc/150?u=1",
    time: "Vừa xong",
    isOnline: true,
  ),
  ChatUser(
    id: "65bf1234567890abcdef1235",
    name: "Lê Thị B",
    messageText: "Cảm ơn bạn nhiều nhé!",
    image: "https://i.pravatar.cc/150?u=2",
    time: "Yesterday",
    isOnline: false,
  ),
  ChatUser(
    id: "65bf1234567890abcdef1236",
    name: "Nguyễn Văn C",
    messageText: "Khi nào rảnh qua lấy sách?",
    image: "https://i.pravatar.cc/150?u=3",
    time: "31 Mar",
    isOnline: true,
  ),
];

class NotificationItem {
  final String title;
  final String content;
  final String time;
  final bool isRead;
  final String type; // "system", "point", "event"

  NotificationItem({
    required this.title,
    required this.content,
    required this.time,
    required this.isRead,
    required this.type,
  });
}

// Dữ liệu mẫu
final List<NotificationItem> mockNotifications = [
  NotificationItem(
    title: "Cộng điểm thành công",
    content: "Chúc mừng! Bạn nhận được 20 điểm từ bài Quiz 'Phân loại rác'.",
    time: "Vừa xong",
    isRead: false,
    type: "point",
  ),
  NotificationItem(
    title: "Sự kiện mới: Thu gom pin cũ",
    content: "CLB Môi trường xanh vừa đăng một sự kiện mới. Đăng ký ngay!",
    time: "2 giờ trước",
    isRead: false,
    type: "event",
  ),
  NotificationItem(
    title: "Chào mừng thành viên mới",
    content:
        "Chào mừng bạn gia nhập cộng đồng Eco App. Hãy cùng nhau bảo vệ môi trường nhé!",
    time: "1 ngày trước",
    isRead: true,
    type: "system",
  ),
];
