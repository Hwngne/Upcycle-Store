import 'package:flutter/material.dart';
import '../../services/event_service.dart';
import 'event_detail_page.dart';

class EventManagementPage extends StatefulWidget {
  const EventManagementPage({super.key});

  @override
  State<EventManagementPage> createState() => _EventManagementPageState();
}

class _EventManagementPageState extends State<EventManagementPage> {
  List<dynamic> _allEvents = [];
  List<dynamic> _filteredEvents = [];
  bool _isLoading = true;

  late DateTime _startDate;
  late DateTime _endDate;

  @override
  void initState() {
    super.initState();

    final now = DateTime.now();
    _startDate = now.subtract(const Duration(days: 30));
    _endDate = now.add(const Duration(days: 30));

    _fetchMyEvents();
  }

  Future<void> _fetchMyEvents() async {
    final events = await EventService.getMyEvents();
    if (mounted) {
      setState(() {
        _allEvents = events;
        _isLoading = false;
      });
      _filterEvents();
    }
  }

  Future<void> _handleRefresh() async {
    setState(() => _isLoading = true);
    await _fetchMyEvents();
  }

  Future<void> _pickDate(bool isStart) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _startDate : _endDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            primaryColor: const Color(0xFFB71C1C),
            colorScheme: const ColorScheme.light(primary: Color(0xFFB71C1C)),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
      _filterEvents();
    }
  }

  void _filterEvents() {
    setState(() {
      _filteredEvents = _allEvents.where((event) {
        String dateStr = event['date'] ?? "";

        try {
          List<String> parts = dateStr.split('/');
          if (parts.length == 3) {
            DateTime eventDate = DateTime(
              int.parse(parts[2]),
              int.parse(parts[1]),
              int.parse(parts[0]),
            );

            DateTime start = DateUtils.dateOnly(_startDate);
            DateTime end = DateUtils.dateOnly(_endDate);
            DateTime target = DateUtils.dateOnly(eventDate);

            return (target.isAtSameMomentAs(start) || target.isAfter(start)) &&
                (target.isAtSameMomentAs(end) || target.isBefore(end));
          }
          return false;
        } catch (e) {
          return false;
        }
      }).toList();
    });
  }

  Map<String, dynamic> _getStatusDisplay(String? status) {
    switch (status) {
      case 'pending':
        return {'text': 'Chờ duyệt', 'color': Colors.orange};
      case 'approved':
        return {'text': 'Chấp nhận', 'color': Colors.green};
      case 'rejected':
        return {'text': 'Từ chối', 'color': Colors.red};
      default:
        return {'text': 'Chờ duyệt', 'color': Colors.grey};
    }
  }

  String _formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFFB71C1C),
        title: const Text(
          "Quản lý sự kiện",
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
          // 1. HEADER THỐNG KÊ
          Container(
            padding: const EdgeInsets.all(20),
            color: const Color(0xFF1A237E),
            child: Row(
              children: [
                const Icon(Icons.event_note, color: Colors.white, size: 30),
                const SizedBox(width: 10),
                const Text(
                  "Sự kiện đã gửi",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Text(
                  "${_allEvents.length}",
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          // 2. BỘ LỌC NGÀY
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(15),
            child: Column(
              children: [
                GestureDetector(
                  onTap: () => _pickDate(true),
                  child: _buildDateRow("Từ ngày", _formatDate(_startDate)),
                ),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () => _pickDate(false),
                  child: _buildDateRow("Đến ngày", _formatDate(_endDate)),
                ),
              ],
            ),
          ),

          // 3. RADIO BUTTON
          GestureDetector(
            onTap: () {
              setState(() {
                _startDate = DateTime(2020);
                _endDate = DateTime(2030);
                _filterEvents();
              });
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
              child: Row(
                children: [
                  Icon(
                    Icons.radio_button_checked,
                    color: Colors.red[900],
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    "Hiển thị tất cả sự kiện",
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
            ),
          ),

          // 4. DANH SÁCH SỰ KIỆN
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredEvents.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.search_off,
                          size: 50,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "Không tìm thấy sự kiện nào trong khoảng này",
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _handleRefresh,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 15),
                      itemCount: _filteredEvents.length,
                      itemBuilder: (context, index) {
                        return _buildEventCard(_filteredEvents[index]);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateRow(String label, String date) {
    return Row(
      children: [
        SizedBox(
          width: 70,
          child: Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
              color: Colors.white,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(date, style: const TextStyle(fontWeight: FontWeight.bold)),
                const Icon(Icons.calendar_today, size: 16, color: Colors.red),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEventCard(Map<String, dynamic> event) {
    final statusInfo = _getStatusDisplay(event['status']);

    String priceText = "Miễn phí";
    if (event['isPaid'] == true) {
      priceText = "${event['price'] ?? 0} VND";
    }

    String promoStatusText = "Chưa đăng ký";
    Color promoColor = Colors.grey;

    List promoLocs = event['promotionLocations'] ?? [];
    String pStatus = event['promotionStatus'] ?? 'none';
    DateTime now = DateTime.now();
    DateTime? startDate;
    try {
      List<String> parts = (event['promotionStartDate'] ?? "").split('/');
      if (parts.length == 3) {
        startDate = DateTime(
          int.parse(parts[2]),
          int.parse(parts[1]),
          int.parse(parts[0]),
        );
      }
    } catch (e) {}

    if (promoLocs.isNotEmpty) {
      if (pStatus == 'active') {
        promoStatusText = "Đang chạy";
        promoColor = Colors.green;
      } else if (pStatus == 'approved') {
        if (startDate != null && now.isBefore(startDate)) {
          promoStatusText = "Đã duyệt (Chờ chạy)";
          promoColor = Colors.teal;
        } else {
          promoStatusText = "Đang chạy";
          promoColor = Colors.green;
        }
      } else if (pStatus == 'rejected') {
        promoStatusText = "Từ chối";
        promoColor = Colors.red;
      } else {
        promoStatusText = "Chờ duyệt";
        promoColor = Colors.orange;
      }
    }

    return GestureDetector(
      onTap: () {
        final Map<String, dynamic> mappedEvent = {
          'title': event['name'] ?? "Không tên",
          'topic': event['topic'] ?? "Chưa cập nhật",
          'date': event['date'] ?? "",
          'author': event['contactName'] ?? "Không rõ",
          'description': event['description'] ?? "",
          'location': event['location'] ?? "",
          'status': statusInfo['text'],
          'promotionStatus': promoStatusText,
          'price': event['price'] ?? "0",
          'isPaid': event['isPaid'] ?? false,
          'id': event['_id'] is Map ? event['_id']['\$oid'] : event['_id'],
          'contactEmail': event['contactEmail'] ?? "",
          'contactPhone': event['contactPhone'] ?? "",
          'formLink': event['formLink'] ?? "",
          'promotionLocations': event['promotionLocations'] ?? [],
          'promotionStartDate': event['promotionStartDate'] ?? "",
          'promotionEndDate': event['promotionEndDate'] ?? "",
          'bannerUrl': event['bannerUrl'] ?? "",
          'attachmentUrl': event['attachmentUrl'] ?? "",
        };

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (c) => EventDetailPage(eventData: mappedEvent),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 15),
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
          border: Border(
            left: BorderSide(color: statusInfo['color'], width: 5),
          ),
        ),
        child: Column(
          children: [
            _buildInfoRow(
              "Tên sự kiện",
              event['name'] ?? "Không tên",
              isBold: true,
            ),
            _buildInfoRow(
              "Trạng thái",
              statusInfo['text'],
              color: statusInfo['color'],
              isBold: true,
            ),
            _buildInfoRow("Giá vé", priceText),
            _buildInfoRow("Quảng bá", promoStatusText, color: promoColor),
            _buildInfoRow("Người phụ trách", event['contactName'] ?? "---"),
            _buildInfoRow(
              "Ngày",
              event['date'] ?? "---",
              color: Colors.blueGrey,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    String label,
    String value, {
    bool isBold = false,
    Color? color,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ),
          Expanded(
            child: Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
                color: color ?? Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
