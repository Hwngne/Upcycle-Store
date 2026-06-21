import 'package:flutter/material.dart';
import '../../services/event_service.dart';

class ParticipantsListPage extends StatefulWidget {
  final String eventId;
  final String eventTitle;

  const ParticipantsListPage({
    super.key,
    required this.eventId,
    required this.eventTitle,
  });

  @override
  State<ParticipantsListPage> createState() => _ParticipantsListPageState();
}

class _ParticipantsListPageState extends State<ParticipantsListPage> {
  List<dynamic> _allParticipants = [];
  List<dynamic> _foundParticipants = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchParticipants(); // Gọi API ngay khi mở màn hình
  }

  Future<void> _fetchParticipants() async {
    setState(() => _isLoading = true);
    try {
      // Gọi hàm lấy danh sách từ EventService
      final participants = await EventService.getEventParticipants(
        widget.eventId,
      );
      if (mounted) {
        setState(() {
          _allParticipants = participants;
          _foundParticipants = participants;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể tải danh sách sinh viên')),
        );
      }
    }
  }

  void _runFilter(String enteredKeyword) {
    List<dynamic> results = [];
    if (enteredKeyword.isEmpty) {
      results = _allParticipants;
    } else {
      results = _allParticipants.where((p) {
        final name = (p['studentName'] ?? "").toString().toLowerCase();
        final code = (p['studentCode'] ?? "").toString().toLowerCase();
        // Lọc theo cả tên hoặc mã số sinh viên
        return name.contains(enteredKeyword.toLowerCase()) ||
            code.contains(enteredKeyword.toLowerCase());
      }).toList();
    }
    setState(() => _foundParticipants = results);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      appBar: AppBar(
        title: Text(
          widget.eventTitle, // Hiển thị tên sự kiện trên AppBar
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        backgroundColor: const Color(0xFFB71C1C),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(15),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => _runFilter(value),
              decoration: InputDecoration(
                hintText: "Tìm tên hoặc MSSV...",
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Danh sách hoặc Trạng thái Loading
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _foundParticipants.isEmpty
                ? const Center(child: Text("Không có sinh viên nào"))
                : RefreshIndicator(
                    onRefresh: _fetchParticipants,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 15),
                      itemCount: _foundParticipants.length,
                      itemBuilder: (context, index) {
                        final p = _foundParticipants[index];
                        final name = p['studentName'] ?? "Ẩn danh";
                        final initial = name.toString().trim().isNotEmpty
                            ? name.toString().trim()[0].toUpperCase()
                            : "?";

                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Colors.red[50],
                              child: Text(
                                initial,
                                style: const TextStyle(
                                  color: Color(0xFFB71C1C),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              name,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            subtitle: Builder(
                              builder: (context) {
                                String rawCode = (p['studentCode'] ?? "")
                                    .toString();
                                String email = (p['email'] ?? "").toString();

                                // Chuyển về in hoa và xóa khoảng trắng thừa để so sánh
                                String codeToCheck = rawCode
                                    .trim()
                                    .toUpperCase();

                                // Nếu MSSV trống hoặc bằng "N/A", chỉ hiển thị Email
                                if (codeToCheck.isEmpty ||
                                    codeToCheck == "N/A") {
                                  return Text(email);
                                }

                                // Nếu có MSSV hợp lệ, hiển thị cả hai
                                return Text(
                                  "$rawCode • $email",
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                );
                              },
                            ),
                            trailing: Icon(
                              p['checkInStatus'] == 'attended'
                                  ? Icons.check_circle
                                  : Icons.radio_button_unchecked,
                              color: p['checkInStatus'] == 'attended'
                                  ? Colors.green
                                  : Colors.grey,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
