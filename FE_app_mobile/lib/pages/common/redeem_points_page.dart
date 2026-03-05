import 'package:flutter/material.dart';
import '../../components/app_background.dart';
import '../../services/gift_service.dart';
import '../../services/user_service.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RedeemPointsPage extends StatefulWidget {
  const RedeemPointsPage({super.key});

  @override
  State<RedeemPointsPage> createState() => _RedeemPointsPageState();
}

class _RedeemPointsPageState extends State<RedeemPointsPage> {
  final GiftService _giftService = GiftService();

  // State Variables
  List<dynamic> _gifts = [];
  bool _isLoading = true;
  int _currentPoints = 0;

  // Logic hiển thị "Xem thêm"
  bool _isExpanded = false;
  final int _initialCount = 6;

  @override
  void initState() {
    super.initState();
    // 1. Lấy điểm hiện tại từ bộ nhớ đệm (UserData)
    _currentPoints = UserData.points ?? 0;
    // 2. Tải danh sách quà
    _loadGifts();
  }

  Future<void> _loadGifts() async {
    final gifts = await _giftService.fetchGifts();
    if (mounted) {
      setState(() {
        _gifts = gifts;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Tính toán số lượng item cần hiển thị
    int displayCount = _gifts.length;
    if (!_isExpanded && _gifts.length > _initialCount) {
      displayCount = _initialCount;
    }

    return Scaffold(
      body: AppBackground(
        child: Column(
          children: [
            // 1. HEADER (Giữ nguyên)
            Container(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 10,
                bottom: 20,
                left: 10,
                right: 20,
              ),
              color: const Color(0xFFB71C1C),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Expanded(
                    child: Center(
                      child: Text(
                        "Đổi điểm tích lũy",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 40),
                ],
              ),
            ),

            // 2. BODY
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Thẻ điểm
                          _buildPointCard(),

                          const SizedBox(height: 30),
                          const Text(
                            "Danh mục đổi điểm",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Lưới quà tặng (Dùng dữ liệu API)
                          _gifts.isEmpty
                              ? const Center(
                                  child: Text("Hiện chưa có quà nào."),
                                )
                              : GridView.builder(
                                  padding: EdgeInsets.zero,
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  gridDelegate:
                                      const SliverGridDelegateWithFixedCrossAxisCount(
                                        crossAxisCount: 2,
                                        childAspectRatio: 0.8,
                                        crossAxisSpacing: 15,
                                        mainAxisSpacing: 15,
                                      ),
                                  itemCount: displayCount,
                                  itemBuilder: (context, index) {
                                    return _buildGiftCard(_gifts[index]);
                                  },
                                ),

                          // Nút "Xem thêm" / "Thu gọn"
                          if (_gifts.length > _initialCount)
                            Padding(
                              padding: const EdgeInsets.only(top: 20.0),
                              child: Center(
                                child: TextButton.icon(
                                  onPressed: () {
                                    setState(() {
                                      _isExpanded = !_isExpanded;
                                    });
                                  },
                                  icon: Icon(
                                    _isExpanded
                                        ? Icons.keyboard_arrow_up
                                        : Icons.keyboard_arrow_down,
                                    color: const Color(0xFFB71C1C),
                                  ),
                                  label: Text(
                                    _isExpanded
                                        ? "Thu gọn"
                                        : "Xem thêm (${_gifts.length - _initialCount} món nữa)",
                                    style: const TextStyle(
                                      color: Color(0xFFB71C1C),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ),

                          const SizedBox(height: 50),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  // Widget hiển thị điểm số
  Widget _buildPointCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 25, horizontal: 30),
      decoration: BoxDecoration(
        color: const Color(0xFF2C2C54),
        borderRadius: BorderRadius.circular(15),
        boxShadow: const [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 10,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: const [
              Icon(Icons.diamond, color: Colors.white, size: 28),
              SizedBox(width: 10),
              Text(
                "Điểm",
                style: TextStyle(color: Colors.white70, fontSize: 18),
              ),
            ],
          ),
          Text(
            "$_currentPoints",
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  // Widget thẻ quà tặng (Mapping dữ liệu thật)
  Widget _buildGiftCard(dynamic gift) {
    // Mapping dữ liệu từ MongoDB
    String name = gift['name'] ?? "Quà tặng";
    String imageUrl = gift['imageUrl'] ?? "";
    int point = gift['point'] ?? 0;
    int quantity = gift['quantity'] ?? 0;
    bool isOutOfStock = quantity <= 0;

    return InkWell(
      onTap: () => _showDetailDialog(gift), // Vẫn cho bấm vào để xem (Tạo FOMO)
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Ảnh (Dùng Stack để đè chữ HẾT HÀNG lên)
            Expanded(
              flex: 3,
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Stack(
                  children: [
                    // 1. Ảnh Quà (Nếu hết hàng thì làm xám)
                    ColorFiltered(
                      colorFilter: isOutOfStock
                          ? const ColorFilter.mode(
                              Colors.grey,
                              BlendMode.saturation,
                            ) // Trắng đen
                          : const ColorFilter.mode(
                              Colors.transparent,
                              BlendMode.multiply,
                            ), // Bình thường
                      child: Center(
                        // Bọc Center để ảnh nằm giữa
                        child: Image.network(
                          imageUrl,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(
                                Icons.card_giftcard,
                                size: 50,
                                color: Colors.grey,
                              ),
                        ),
                      ),
                    ),

                    // 2. Nhãn "HẾT HÀNG" (Chỉ hiện khi quantity <= 0)
                    if (isOutOfStock)
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(
                              0.5,
                            ), // Lớp mờ trắng phủ lên
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black87,
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: const Text(
                                "HẾT HÀNG",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            // Tên quà
            Expanded(
              flex: 1,
              child: Center(
                child: Text(
                  name,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: isOutOfStock ? Colors.grey : Colors.black87,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 5),

            // Giá điểm
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: isOutOfStock
                    ? Colors.grey.shade200
                    : const Color(0xFFB71C1C).withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                "$point Điểm",
                style: TextStyle(
                  fontSize: 12,
                  color: isOutOfStock ? Colors.grey : const Color(0xFFB71C1C),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- POPUP CHI TIẾT ---
  void _showDetailDialog(dynamic gift) {
    String name = gift['name'] ?? "";
    String description = gift['description'] ?? "Chưa có mô tả";
    String imageUrl = gift['imageUrl'] ?? "";
    int quantity = gift['quantity'] ?? 0;
    bool isOutOfStock = quantity <= 0;

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Ảnh trong popup cũng nên xám nếu hết hàng
              ColorFiltered(
                colorFilter: isOutOfStock
                    ? const ColorFilter.mode(Colors.grey, BlendMode.saturation)
                    : const ColorFilter.mode(
                        Colors.transparent,
                        BlendMode.multiply,
                      ),
                child: Image.network(
                  imageUrl,
                  height: 80,
                  errorBuilder: (c, e, s) => const Icon(
                    Icons.card_giftcard,
                    size: 80,
                    color: Colors.grey,
                  ),
                ),
              ),
              const SizedBox(height: 15),
              _buildInfoRow("Quà", name),
              const SizedBox(height: 10),
              _buildInfoRow("Mô tả", description, maxLines: 3),
              const SizedBox(height: 10),
              _buildInfoRow(
                "Tình trạng",
                isOutOfStock ? "Đã hết hàng" : "Còn $quantity cái",
              ),
              const SizedBox(height: 25),
              SizedBox(
                width: double.infinity,
                height: 45,
                child: ElevatedButton(
                  onPressed: isOutOfStock
                      ? null
                      : () {
                          Navigator.pop(context);
                          _processRedemption(gift);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFB71C1C),
                    disabledBackgroundColor: Colors.grey,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: Text(
                    isOutOfStock ? "HẾT HÀNG" : "ĐỔI",
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- LOGIC ĐỔI QUÀ (GỌI API) ---
  void _processRedemption(dynamic gift) async {
    int cost = gift['point'] ?? 0;

    // 1. Kiểm tra điểm Client trước
    if (_currentPoints < cost) {
      _showFailureDialog("Không đủ điểm để đổi quà này!");
      return;
    }

    // 2. Hiện loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    // 3. Gọi API
    final result = await _giftService.redeemGift(gift['_id']);

    // 4. Tắt loading
    if (mounted) Navigator.pop(context);

    // 5. Xử lý kết quả
    if (result['success']) {
      // 👇 KHAI BÁO BIẾN newPoints TẠI ĐÂY ĐỂ DÙNG ĐƯỢC Ở DƯỚI
      int newPoints = result['data']['newPoints'];

      setState(() {
        _currentPoints = newPoints;
        UserData.points = newPoints;
      });

      // Lưu vào bộ nhớ máy (SharedPreferences)
      try {
        final prefs = await SharedPreferences.getInstance();
        if (UserData.email != null) {
          // 👇 Bây giờ biến newPoints đã hợp lệ
          await prefs.setInt('points_${UserData.email}', newPoints);
          print("💾 Đã cập nhật cache điểm số: $newPoints");
        }
      } catch (e) {
        print("⚠️ Lỗi lưu cache: $e");
      }

      // Lấy thông tin hiển thị
      String code = result['data']['code'];
      String location = result['data']['location'];
      String expiresAtRaw = result['data']['expiresAt'];

      _showSuccessItemDialog(gift['name'], code, location, expiresAtRaw);
    } else {
      _showFailureDialog(result['message']);
    }
  }

  void _showSuccessItemDialog(
    String giftName,
    String code,
    String location,
    String expiresAtRaw,
  ) {
    DateTime expiryDate = DateTime.parse(expiresAtRaw);
    String formattedDate = DateFormat('HH:mm dd/MM/yyyy').format(expiryDate);

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Đổi vật phẩm thành công!",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: Colors.green,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Text(
                    "Bạn đã đổi thành công 1 $giftName",
                    style: const TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          "MÃ NHẬN QUÀ",
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 5),
                        SelectableText(
                          code, // Mã code thật từ server
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB71C1C),
                            letterSpacing: 1,
                          ),
                        ),
                        const Divider(height: 15),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            vertical: 8,
                            horizontal: 10,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.orange.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(5),
                            border: Border.all(
                              color: Colors.orange.withOpacity(0.5),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.timer,
                                size: 16,
                                color: Colors.orange,
                              ),
                              const SizedBox(width: 5),
                              Text(
                                "Hết hạn: $formattedDate",
                                style: const TextStyle(
                                  color: Colors.deepOrange,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 5),
                        Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              color: Colors.grey,
                              size: 20,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    "Nơi nhận:",
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey,
                                    ),
                                  ),
                                  Text(
                                    location, // Địa điểm thật từ DB
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 45,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB71C1C),
                      ),
                      child: const Text(
                        "ĐÓNG",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFailureDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(15),
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.close, color: Colors.white, size: 40),
              ),
              const SizedBox(height: 20),
              const Text(
                "Thông báo",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              const SizedBox(height: 10),
              Text(
                message, // Hiển thị lỗi từ Server (VD: Hết hàng, Thiếu điểm)
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: 120,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFB71C1C),
                  ),
                  child: const Text(
                    "ĐÓNG",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {int maxLines = 1}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, color: Colors.black87),
              maxLines: maxLines,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ],
    );
  }
}
