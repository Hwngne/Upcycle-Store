import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../services/user_service.dart';
import '../../services/event_service.dart';

class EventDetailPage extends StatefulWidget {
  final Map<String, dynamic> eventData;
  const EventDetailPage({super.key, required this.eventData});

  @override
  State<EventDetailPage> createState() => _EventDetailPageState();
}

class _EventDetailPageState extends State<EventDetailPage> {
  bool _isLoading = false;
  bool _isRegistered = false;

  @override
  void initState() {
    super.initState();
    _checkInitialRegistrationStatus();
  }

  // ĐÃ THÊM: Hàm xử lý mở Link đính kèm
  Future<void> _launchUrl(String url) async {
    if (url.isEmpty) return;
    final Uri uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      debugPrint("Could not launch $url");
    }
  }

  // 1. KIỂM TRA XEM SINH VIÊN ĐÃ ĐĂNG KÝ TỪ TRƯỚC CHƯA
  void _checkInitialRegistrationStatus() {
    final participants =
        widget.eventData['participants'] as List<dynamic>? ?? [];
    final myId = UserData.id;

    if (myId != null && participants.isNotEmpty) {
      bool alreadyRegistered = participants.any((p) {
        String studentId = p['studentId'] is String
            ? p['studentId']
            : p['studentId']['_id'];
        return studentId == myId;
      });

      setState(() {
        _isRegistered = alreadyRegistered;
      });
    }
  }

  // 2. HÀM XỬ LÝ ĐĂNG KÝ (Gọi API)
  Future<void> _handleRegister() async {
    setState(() => _isLoading = true);

    final String eventId =
        widget.eventData['_id'] ?? widget.eventData['id'] ?? '';

    if (eventId.isEmpty) {
      _showModernSnackBar("Lỗi: Không tìm thấy ID sự kiện!", Colors.red);
      setState(() => _isLoading = false);
      return;
    }

    bool success = await EventService.registerEvent(eventId);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      setState(() {
        _isRegistered = true;
      });
      _showModernSnackBar("Đăng ký thành công! Vé đã được lưu.", Colors.green);
    } else {
      _showModernSnackBar(
        "Đăng ký thất bại hoặc bạn đã đăng ký rồi.",
        Colors.orange,
      );
    }
  }

  // HÀM SNACKBAR HIỆN ĐẠI
  void _showModernSnackBar(String msg, Color color) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Container(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Icon(
                color == Colors.green
                    ? Icons.check_circle_outline
                    : Icons.error_outline,
                color: Colors.white,
                size: 28,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  msg,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        margin: const EdgeInsets.only(bottom: 20, left: 20, right: 20),
        elevation: 6,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  // HÀM HIỂN THỊ VÉ ĐIỆN TỬ (MÃ QR)
  void _showTicketQR() {
    // Lấy ID sinh viên và ID sự kiện để làm mã QR bảo mật
    final String myId = UserData.id ?? "UNKNOWN_USER";
    final String eventId =
        widget.eventData['_id'] ?? widget.eventData['id'] ?? "UNKNOWN_EVENT";
    final String qrData = "$myId-$eventId";

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.all(25),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "VÉ ĐIỆN TỬ",
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFB71C1C),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                widget.eventData['title'] ?? "Tên sự kiện",
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),

              // MÃ QR  (Dùng qr_flutter)
              Container(
                width: 200,
                height: 200,
                color: Colors.white,
                alignment: Alignment.center,
                child: QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
                  size: 200.0,
                  foregroundColor: Colors.black, // Màu mã QR
                ),
              ),

              const SizedBox(height: 20),
              const Text(
                "Đưa mã này cho Ban tổ chức\nđể điểm danh khi đến sự kiện",
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB71C1C),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Text(
                  "Đóng",
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final data = widget.eventData;

    // --- LẤY DỮ LIỆU ---
    final String title = data['title'] ?? "Chi tiết sự kiện";
    final String topic = data['topic'] ?? "Chưa cập nhật";
    final String desc = data['description'] ?? "";
    final String location = data['location'] ?? "";
    final String author = data['contactName'] ?? "Không có";
    final String email = data['contactEmail'] ?? "Không có";
    final String phone = data['contactPhone'] ?? "Không có";
    final String bannerUrl = data['bannerUrl'] ?? "";
    final String attachmentUrl = data['attachmentUrl'] ?? "";
    final String status = data['status'] ?? "pending";

    bool isPaid =
        data['isPaid'] == true ||
        (data['price'] != null && data['price'] != "Miễn phí");

    // Xử lý Ngày diễn ra & Hạn chót
    DateFormat inputFmt = DateFormat("yyyy-MM-dd'T'HH:mm:ss");
    DateFormat displayFmt = DateFormat('HH:mm - dd/MM/yyyy');

    String eventDateStr = "Chưa cập nhật";
    String deadlineStr = "Chưa cập nhật";
    bool isPastDeadline = false;

    try {
      if (data['eventDate'] != null) {
        DateTime eDate = DateTime.parse(data['eventDate']).toLocal();
        eventDateStr = displayFmt.format(eDate);
      }
      if (data['registrationDeadline'] != null) {
        DateTime dDate = DateTime.parse(data['registrationDeadline']).toLocal();
        deadlineStr = displayFmt.format(dDate);
        isPastDeadline = DateTime.now().isAfter(dDate);
      }
    } catch (e) {
      debugPrint("Lỗi parse ngày tháng: $e");
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        title: const Text(
          "Chi tiết sự kiện",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Banner Title
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(15),
            color: const Color(0xFF1A237E),
            child: Column(
              children: [
                Text(
                  title.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  topic,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle("Thông tin sự kiện"),
                  const SizedBox(height: 15),

                  // Ảnh Banner
                  if (bannerUrl.isNotEmpty) ...[
                    Container(
                      height: 180,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.grey.shade300),
                        image: DecorationImage(
                          image: kIsWeb
                              ? NetworkImage(bannerUrl)
                              : (bannerUrl.startsWith('http')
                                    ? NetworkImage(bannerUrl)
                                    : FileImage(File(bannerUrl))
                                          as ImageProvider),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 15),
                  ],

                  _buildTextField("Tên sự kiện", title),
                  _buildTextField("Chủ đề", topic),
                  _buildTextField("Mô tả sự kiện", desc, maxLines: 4),

                  const SizedBox(height: 10),
                  // Giá vé
                  Row(
                    children: [
                      const Text(
                        "Hình thức",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 15),
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 15,
                                vertical: 5,
                              ),
                              decoration: BoxDecoration(
                                color: !isPaid
                                    ? Colors.white
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: !isPaid
                                    ? [
                                        const BoxShadow(
                                          color: Colors.black12,
                                          blurRadius: 2,
                                        ),
                                      ]
                                    : [],
                              ),
                              child: Text(
                                "Miễn phí",
                                style: TextStyle(
                                  color: !isPaid ? Colors.blue : Colors.grey,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 15,
                                vertical: 5,
                              ),
                              decoration: BoxDecoration(
                                color: isPaid
                                    ? Colors.white
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: isPaid
                                    ? [
                                        const BoxShadow(
                                          color: Colors.black12,
                                          blurRadius: 2,
                                        ),
                                      ]
                                    : [],
                              ),
                              child: Text(
                                "Có phí",
                                style: TextStyle(
                                  color: isPaid ? Colors.blue : Colors.grey,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (isPaid) ...[
                    const SizedBox(height: 10),
                    _buildTextField(
                      "Giá vé",
                      "${data['price']} VND",
                      textColor: Colors.red,
                    ),
                  ],

                  const SizedBox(height: 15),
                  _buildTextField("Địa điểm", location),
                  _buildTextField("Thời gian diễn ra", eventDateStr),
                  _buildTextField(
                    "Hạn chót đăng ký",
                    deadlineStr,
                    textColor: Colors.red,
                  ),

                  const SizedBox(height: 30),
                  _buildSectionTitle("Thông tin liên hệ"),
                  const SizedBox(height: 15),
                  _buildTextField("Người phụ trách", author),
                  _buildTextField("Email", email),
                  _buildTextField("Sđt", phone),

                  const SizedBox(height: 30),
                  _buildSectionTitle("Tài liệu đính kèm"),
                  const SizedBox(height: 15),
                  if (attachmentUrl.isNotEmpty)
                    GestureDetector(
                      onTap: () => _launchUrl(attachmentUrl),
                      child: Container(
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF5F5FA),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: Row(
                          children: const [
                            Icon(Icons.attach_file, color: Color(0xFFB71C1C)),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                "Xem tài liệu chi tiết",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF2C2C54),
                                ),
                              ),
                            ),
                            Icon(
                              Icons.open_in_new,
                              size: 16,
                              color: Colors.grey,
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    const Text(
                      "Không có tài liệu đính kèm.",
                      style: TextStyle(
                        color: Colors.grey,
                        fontStyle: FontStyle.italic,
                      ),
                    ),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ],
      ),

      // --- THANH ĐIỀU HƯỚNG BÊN DƯỚI (NÚT ĐĂNG KÝ) ---
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.grey.shade200,
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(child: _buildActionButton(status, isPastDeadline)),
      ),
    );
  }

  // --- LOGIC XỬ LÝ NÚT BẤM DỰA VÀO TRẠNG THÁI ---
  Widget _buildActionButton(String status, bool isPastDeadline) {
    if (status == 'pending') {
      return ElevatedButton(
        onPressed: null,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.grey[300],
          padding: const EdgeInsets.symmetric(vertical: 15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          "Sự kiện đang chờ Admin duyệt",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
      );
    }

    if (_isRegistered) {
      return ElevatedButton.icon(
        onPressed: _showTicketQR,
        icon: const Icon(Icons.qr_code, color: Colors.white),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.green,
          padding: const EdgeInsets.symmetric(vertical: 15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        label: const Text(
          "Xem Vé Điện Tử",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      );
    }

    if (isPastDeadline) {
      return ElevatedButton(
        onPressed: null,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.grey[300],
          padding: const EdgeInsets.symmetric(vertical: 15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          "Đã đóng đăng ký",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
      );
    }

    return ElevatedButton(
      onPressed: _isLoading ? null : _handleRegister,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFFB71C1C),
        padding: const EdgeInsets.symmetric(vertical: 15),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: _isLoading
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            )
          : const Text(
              "Đăng ký tham gia",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
    );
  }

  // --- WIDGET HELPER ---
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: Color(0xFF2C2C54),
      ),
    );
  }

  Widget _buildTextField(
    String label,
    String value, {
    int maxLines = 1,
    Color? textColor,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 100,
                  child: Text(
                    label.replaceAll("*", ""),
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ),
                Container(
                  width: 1,
                  height: 20,
                  color: Colors.grey[300],
                  margin: const EdgeInsets.symmetric(horizontal: 10),
                ),
                Expanded(
                  child: Text(
                    value,
                    style: TextStyle(
                      fontSize: 13,
                      color: textColor ?? Colors.black87,
                      fontWeight: textColor != null
                          ? FontWeight.bold
                          : FontWeight.normal,
                    ),
                    maxLines: maxLines,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
