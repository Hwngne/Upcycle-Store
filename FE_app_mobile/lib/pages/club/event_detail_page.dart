import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class EventDetailPage extends StatelessWidget {
  final Map<String, dynamic> eventData;
  const EventDetailPage({super.key, required this.eventData});

  Future<void> _launchUrl(String url) async {
    if (url.isEmpty) return;
    final Uri uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      debugPrint("Could not launch $url");
    }
  }

  @override
  Widget build(BuildContext context) {
    // --- LẤY DỮ LIỆU ---
    final String title = eventData['title'] ?? "Chi tiết sự kiện";
    final String topic = eventData['topic'] ?? "Chưa cập nhật";
    final String desc = eventData['description'] ?? "";
    final String location = eventData['location'] ?? "";
    final String date = eventData['date'] ?? "";
    final String author = eventData['author'] ?? "";
    final String email = eventData['contactEmail'] ?? "";
    final String phone = eventData['contactPhone'] ?? "";
    final String formLink = eventData['formLink'] ?? "";
    final String bannerUrl = eventData['bannerUrl'] ?? "";
    final String attachmentUrl = eventData['attachmentUrl'] ?? "";
    bool isPaid =
        eventData['isPaid'] == true ||
        (eventData['price'] != null && eventData['price'] != "Miễn phí");

    final List<dynamic> promoLocs = eventData['promotionLocations'] ?? [];
    final String promoStart = eventData['promotionStartDate'] ?? "";
    final String promoEnd = eventData['promotionEndDate'] ?? "";
    final bool hasPromo = promoLocs.isNotEmpty;

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
                              : FileImage(File(bannerUrl)) as ImageProvider,
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
                    _buildTextField("Giá vé", "${eventData['price']} VND"),
                  ],

                  const SizedBox(height: 15),
                  _buildTextField("Địa điểm", location),
                  _buildTextField("Ngày tổ chức", date),

                  const SizedBox(height: 30),
                  _buildSectionTitle("Thông tin liên hệ"),
                  const SizedBox(height: 15),
                  _buildTextField(
                    "Người phụ trách",
                    author.isEmpty ? "Không có" : author,
                  ),
                  _buildTextField("Email", email.isEmpty ? "Không có" : email),
                  _buildTextField("Sđt", phone.isEmpty ? "Không có" : phone),

                  if (formLink.isNotEmpty)
                    GestureDetector(
                      onTap: () => _launchUrl(formLink),
                      child: _buildTextField(
                        "Form đăng ký",
                        formLink,
                        textColor: Colors.blue,
                      ),
                    ),

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
                  if (hasPromo)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF3E0),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.orange.shade200),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.campaign, color: Colors.deepOrange),
                              SizedBox(width: 8),
                              Text(
                                "Thông tin quảng bá",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: Colors.deepOrange,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 20),
                          ...promoLocs
                              .map(
                                (loc) => Padding(
                                  padding: const EdgeInsets.only(bottom: 5),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        Icons.check_circle,
                                        size: 16,
                                        color: Colors.deepOrange,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        loc == 'home'
                                            ? "Trang chủ"
                                            : "Diễn đàn",
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                              .toList(),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              const Text(
                                "Thời gian:",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey,
                                ),
                              ),
                              const SizedBox(width: 5),
                              Text(
                                "$promoStart - $promoEnd",
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          const Center(
                            child: Text(
                              "(Đang chờ duyệt)",
                              style: TextStyle(
                                color: Colors.blue,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- WIDGET HELPER ---
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
                      decoration: textColor != null
                          ? TextDecoration.underline
                          : null,
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
