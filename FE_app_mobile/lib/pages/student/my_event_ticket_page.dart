import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../services/event_service.dart';
import '../../services/user_service.dart';

class MyEventTicketsPage extends StatefulWidget {
  const MyEventTicketsPage({super.key});

  @override
  State<MyEventTicketsPage> createState() => _MyEventTicketsPageState();
}

class _MyEventTicketsPageState extends State<MyEventTicketsPage> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _tickets = [];

  @override
  void initState() {
    super.initState();
    _fetchMyTickets();
  }

  Future<void> _fetchMyTickets() async {
    setState(() => _isLoading = true);

    try {
      final ticketsData = await EventService.getMyRegisteredEvents();

      if (mounted) {
        setState(() {
          // Ép kiểu an toàn sang List<Map<String, dynamic>>
          _tickets = List<Map<String, dynamic>>.from(ticketsData);
          _isLoading = false;
        });
      }
    } catch (e) {
      print("Lỗi load vé: $e");
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(
        0xFFF5F5FA,
      ), // Nền xám nhạt làm nổi bật vé trắng
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        title: const Text(
          "Vé sự kiện của tôi",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFB71C1C)),
            )
          : _tickets.isEmpty
          ? _buildEmptyState()
          : RefreshIndicator(
              onRefresh: _fetchMyTickets,
              color: const Color(0xFFB71C1C),
              child: ListView.builder(
                padding: const EdgeInsets.all(20),
                physics: const AlwaysScrollableScrollPhysics(),
                itemCount: _tickets.length,
                itemBuilder: (context, index) {
                  return _buildTicketCard(_tickets[index]);
                },
              ),
            ),
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> ticket) {
    final String studentId = UserData.role ?? "student_id_here";
    final String qrData = "${ticket['eventId']}|$studentId";

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          // --- PHẦN TRÊN: THÔNG TIN SỰ KIỆN ---
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        ticket['status'],
                        style: TextStyle(
                          color: Colors.green.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.confirmation_num_outlined,
                      color: Color(0xFFB71C1C),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                Text(
                  ticket['eventName'],
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A237E),
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 15),
                Row(
                  children: [
                    const Icon(
                      Icons.calendar_month,
                      size: 16,
                      color: Colors.grey,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      ticket['date'],
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(width: 20),
                    const Icon(Icons.access_time, size: 16, color: Colors.grey),
                    const SizedBox(width: 8),
                    Text(
                      ticket['time'],
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 16, color: Colors.grey),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        ticket['location'],
                        style: const TextStyle(
                          fontWeight: FontWeight.w500,
                          color: Colors.black54,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // --- ĐƯỜNG ĐỨT NÉT (DASHED LINE) CHIA VÉ ---
          SizedBox(
            height: 20,
            child: Stack(
              children: [
                Positioned(
                  top: 9,
                  left: 15,
                  right: 15,
                  child: LayoutBuilder(
                    builder:
                        (BuildContext context, BoxConstraints constraints) {
                          final boxWidth = constraints.constrainWidth();
                          const dashWidth = 6.0;
                          const dashHeight = 2.0;
                          final dashCount = (boxWidth / (2 * dashWidth))
                              .floor();
                          return Flex(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            direction: Axis.horizontal,
                            children: List.generate(dashCount, (_) {
                              return SizedBox(
                                width: dashWidth,
                                height: dashHeight,
                                child: const DecoratedBox(
                                  decoration: BoxDecoration(color: Colors.grey),
                                ),
                              );
                            }),
                          );
                        },
                  ),
                ),
                // Lõm bên trái
                Positioned(
                  left: -10,
                  top: 0,
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF5F5FA),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                // Lõm bên phải
                Positioned(
                  right: -10,
                  top: 0,
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: const BoxDecoration(
                      color: Color(0xFFF5F5FA),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // --- PHẦN DƯỚI: MÃ QR ---
          Container(
            padding: const EdgeInsets.only(
              left: 20,
              right: 20,
              bottom: 25,
              top: 5,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
            ),
            child: Column(
              children: [
                QrImageView(
                  data: qrData, // Dữ liệu mã hóa
                  version: QrVersions.auto,
                  size: 160.0,
                  backgroundColor: Colors.white,
                  errorCorrectionLevel: QrErrorCorrectLevel.M,
                ),
                const SizedBox(height: 10),
                const Text(
                  "Đưa mã này cho BTC để điểm danh",
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 13,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.local_activity_outlined,
            size: 80,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 15),
          Text(
            "Bạn chưa đăng ký sự kiện nào",
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB71C1C),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            child: const Text(
              "Khám phá sự kiện ngay",
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
