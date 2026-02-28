import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../services/forum_service.dart';
import '../../services/user_service.dart';
import '../../utils/image_helper.dart';

class CommentSheet extends StatefulWidget {
  final String postId;
  final List<dynamic> initialComments;
  final Function(List<dynamic>) onCommentChanged;

  const CommentSheet({
    super.key,
    required this.postId,
    required this.initialComments,
    required this.onCommentChanged,
  });

  @override
  State<CommentSheet> createState() => _CommentSheetState();
}

class _CommentSheetState extends State<CommentSheet> {
  final TextEditingController _commentController = TextEditingController();
  late List<dynamic> _comments;
  bool _isSending = false;

  // --- BIẾN CHO TÍNH NĂNG REPLY ---
  String? _replyingCommentId;
  String? _replyingToName;
  final FocusNode _focusNode = FocusNode();

  // --- BIẾN CHO TÍNH NĂNG ẢNH ---
  XFile? _pickedImage;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _comments = List.from(widget.initialComments);
  }

  // --- 1. CHỌN ẢNH  ---
  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? originalImage = await _picker.pickImage(source: source);
      
      if (originalImage != null) {
        final compressedImage = await ImageHelper.compressImage(originalImage);
        setState(() {
          _pickedImage = compressedImage;
        });
        
        // Debug: In ra để xem dung lượng giảm bao nhiêu
        final originalLen = await originalImage.length();
        final compressedLen = await compressedImage!.length();
        print("Ảnh gốc: ${(originalLen / 1024).toStringAsFixed(2)} KB");
        print("Ảnh nén: ${(compressedLen / 1024).toStringAsFixed(2)} KB");
      }
    } catch (e) {
      print("Lỗi chọn ảnh: $e");
    }
  }

  // Hiển thị Menu chọn nguồn ảnh
  void _showImageSourcePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Wrap(
        children: [
          ListTile(
            leading: const Icon(Icons.camera_alt, color: Colors.blue),
            title: const Text('Chụp ảnh mới'),
            onTap: () {
              Navigator.pop(context);
              _pickImage(ImageSource.camera);
            },
          ),
          ListTile(
            leading: const Icon(Icons.photo_library, color: Colors.green),
            title: const Text('Chọn từ thư viện'),
            onTap: () {
              Navigator.pop(context);
              _pickImage(ImageSource.gallery);
            },
          ),
        ],
      ),
    );
  }

  void _removeImage() {
    setState(() {
      _pickedImage = null;
    });
  }

  // --- 2. XỬ LÝ GỬI (TEXT + ẢNH + REPLY) ---
  Future<void> _handleSend() async {
    final content = _commentController.text.trim();
    if (content.isEmpty && _pickedImage == null) return;

    setState(() => _isSending = true);

    try {
      if (_replyingCommentId != null) {
        // --- REPLY ---
        String finalContent = content;
        if (_replyingToName != null && content.isNotEmpty) {
          finalContent = "@$_replyingToName $content";
        }

        final newReplies = await ForumService.sendReply(
          widget.postId,
          _replyingCommentId!,
          finalContent,
          _pickedImage,
        );

        if (newReplies != null) {
          setState(() {
            final index = _comments.indexWhere(
              (c) => c['_id'] == _replyingCommentId,
            );
            if (index != -1) {
              _comments[index]['replies'] = newReplies;
            }
            _resetInput();
          });
          _focusNode.unfocus();
        }
      } else {
        // --- COMMENT THƯỜNG ---
        final newComments = await ForumService.sendComment(
          widget.postId,
          content,
          _pickedImage,
        );

        if (newComments != null) {
          setState(() {
            _comments = newComments;
            _resetInput();
          });
          widget.onCommentChanged(_comments);
        }
      }
    } catch (e) {
      print("Lỗi gửi comment: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Gửi thất bại, vui lòng thử lại!")),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  void _resetInput() {
    _commentController.clear();
    _replyingCommentId = null;
    _replyingToName = null;
    _pickedImage = null;
  }

  // --- 3. LOGIC REPLY ---
  void _startReply(String commentId, String userName) {
    setState(() {
      _replyingCommentId = commentId;
      _replyingToName = userName;
    });
    FocusScope.of(context).requestFocus(_focusNode);
  }

  void _cancelReply() {
    setState(() {
      _replyingCommentId = null;
      _replyingToName = null;
    });
    _focusNode.unfocus();
  }

  // --- 4. UI HIỂN THỊ ẢNH TỪ SERVER ---
  Widget _buildCommentImage(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) return const SizedBox.shrink();

    String finalUrl = imageUrl;
    if (!imageUrl.startsWith('http')) {
      finalUrl = "${ForumService.serverUrl}/$imageUrl";
      finalUrl = finalUrl.replaceAll(RegExp(r'(?<!:)/{2,}'), '/');
    }

    return Padding(
      padding: const EdgeInsets.only(top: 8.0),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Image.network(
          finalUrl,
          height: 150,
          width: 200,
          fit: BoxFit.cover,
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return Container(
              height: 150,
              width: 200,
              color: Colors.grey[200],
              child: const Center(
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            );
          },
          errorBuilder: (context, error, stackTrace) {
            print("Lỗi load ảnh comment: $error");
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  // --- 5. CÁC MENU OPTION (SỬA/XÓA) ---
  void _showOptionsModal(
    BuildContext context,
    Map<String, dynamic> cmt,
    int index,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.copy, color: Colors.blue),
              title: const Text('Sao chép nội dung'),
              onTap: () => Navigator.pop(context),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.edit, color: Colors.orange),
              title: const Text('Chỉnh sửa bình luận'),
              onTap: () {
                Navigator.pop(context);
                _showEditDialog(cmt, index);
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete, color: Colors.red),
              title: const Text('Xóa bình luận'),
              onTap: () {
                Navigator.pop(context);
                _confirmDelete(cmt['_id'], index);
              },
            ),
          ],
        );
      },
    );
  }

  void _showReplyOptionsModal(
    BuildContext context,
    Map<String, dynamic> reply,
    String commentId,
    int parentIndex,
    int replyIndex,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.edit, color: Colors.orange),
              title: const Text('Chỉnh sửa câu trả lời'),
              onTap: () {
                Navigator.pop(context);
                _showEditReplyDialog(reply, commentId, parentIndex, replyIndex);
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete, color: Colors.red),
              title: const Text('Xóa câu trả lời'),
              onTap: () {
                Navigator.pop(context);
                _confirmDeleteReply(reply['_id'], commentId, parentIndex);
              },
            ),
          ],
        );
      },
    );
  }

  // --- 6. CÁC DIALOG SỬA/XÓA ---
  void _showEditDialog(Map<String, dynamic> cmt, int index) {
    final TextEditingController editCtrl = TextEditingController(
      text: cmt['content'],
    );
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          top: 20,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Chỉnh sửa bình luận",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: editCtrl,
              autofocus: true,
              maxLines: null,
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () async {
                final newContent = editCtrl.text.trim();
                if (newContent.isEmpty) return;
                final success = await ForumService.editComment(
                  widget.postId,
                  cmt['_id'],
                  newContent,
                );
                if (success) {
                  setState(() => _comments[index]['content'] = newContent);
                  Navigator.pop(context);
                }
              },
              child: const Text("Lưu thay đổi"),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditReplyDialog(
    Map<String, dynamic> reply,
    String commentId,
    int parentIndex,
    int replyIndex,
  ) {
    final TextEditingController editCtrl = TextEditingController(
      text: reply['content'],
    );
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.only(
          top: 20,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              "Sửa câu trả lời",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: editCtrl,
              autofocus: true,
              maxLines: null,
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(15),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () async {
                final newContent = editCtrl.text.trim();
                if (newContent.isEmpty) return;
                final success = await ForumService.editReply(
                  widget.postId,
                  commentId,
                  reply['_id'],
                  newContent,
                );
                if (success) {
                  setState(
                    () =>
                        _comments[parentIndex]['replies'][replyIndex]['content'] =
                            newContent,
                  );
                  Navigator.pop(context);
                }
              },
              child: const Text("Lưu thay đổi"),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(String commentId, int index) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Xóa bình luận?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Hủy"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(context);
              final newComments = await ForumService.deleteComment(
                widget.postId,
                commentId,
              );
              if (newComments != null) {
                setState(() => _comments = newComments);
                widget.onCommentChanged(_comments);
              }
            },
            child: const Text("Xóa", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteReply(String replyId, String commentId, int parentIndex) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Xóa câu trả lời?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Hủy"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(context);
              final newReplies = await ForumService.deleteReply(
                widget.postId,
                commentId,
                replyId,
              );
              if (newReplies != null) {
                setState(() => _comments[parentIndex]['replies'] = newReplies);
              }
            },
            child: const Text("Xóa", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // --- HELPER FUNCTIONS ---
  String _formatTime(String? dateString) {
    if (dateString == null) return "Vừa xong";
    try {
      final date = DateTime.parse(dateString).toLocal();
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 1) return "Vừa xong";
      if (diff.inMinutes < 60) return "${diff.inMinutes} phút trước";
      if (diff.inHours < 24) return "${diff.inHours} giờ trước";
      return "${date.day}/${date.month} lúc ${date.hour}:${date.minute.toString().padLeft(2, '0')}";
    } catch (e) {
      return "Vừa xong";
    }
  }

  String _getUserName(dynamic userJson) {
    if (userJson == null) return "Người dùng ẩn";
    if (userJson['club_info'] != null &&
        userJson['club_info']['club_name'] != null) {
      return userJson['club_info']['club_name'];
    }
    if (userJson['student_name'] != null) return userJson['student_name'];
    if (userJson['name'] != null) return userJson['name'];
    return "Người dùng Eco";
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // HEADER
          Container(
            padding: const EdgeInsets.symmetric(vertical: 10),
            alignment: Alignment.center,
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Text(
              "Bình luận (${_comments.length})",
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
          const Divider(height: 1),

          // LIST VIEW
          Expanded(
            child: _comments.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 50,
                          color: Colors.grey[300],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          "Chưa có bình luận nào.\nHãy là người đầu tiên!",
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(15),
                    itemCount: _comments.length,
                    itemBuilder: (context, index) {
                      final cmt = _comments[index];
                      final user = cmt['user'];
                      final content = cmt['content'];
                      final time = _formatTime(cmt['createdAt']);
                      final avatar = user != null
                          ? (user['avatar'] ?? "https://i.pravatar.cc/150")
                          : "https://i.pravatar.cc/150";
                      final name = _getUserName(user);
                      final List<dynamic> likes = cmt['likes'] ?? [];
                      final List<dynamic> replies = cmt['replies'] ?? [];
                      final String? image = cmt['image'];

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 15),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // --- COMMENT CHA ---
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundImage: NetworkImage(avatar),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      GestureDetector(
                                        onLongPress: () => _showOptionsModal(
                                          context,
                                          cmt,
                                          index,
                                        ),
                                        child: Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: Colors.grey[100],
                                            borderRadius: BorderRadius.circular(
                                              15,
                                            ),
                                          ),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                name,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 13,
                                                ),
                                              ),
                                              if (content
                                                  .toString()
                                                  .isNotEmpty) ...[
                                                const SizedBox(height: 3),
                                                Text(
                                                  content,
                                                  style: const TextStyle(
                                                    fontSize: 14,
                                                    height: 1.3,
                                                  ),
                                                ),
                                              ],
                                              _buildCommentImage(image),
                                            ],
                                          ),
                                        ),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.only(
                                          left: 10,
                                          top: 5,
                                        ),
                                        child: Row(
                                          children: [
                                            Text(
                                              time,
                                              style: TextStyle(
                                                color: Colors.grey[500],
                                                fontSize: 11,
                                              ),
                                            ),
                                            const SizedBox(width: 15),
                                            GestureDetector(
                                              onTap: () async {
                                                final commentId = cmt['_id'];
                                                final newLikes =
                                                    await ForumService.toggleLikeComment(
                                                      widget.postId,
                                                      commentId,
                                                    );
                                                if (newLikes != null) {
                                                  setState(
                                                    () =>
                                                        _comments[index]['likes'] =
                                                            newLikes,
                                                  );
                                                }
                                              },
                                              child: Text(
                                                "Thích",
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12,
                                                  color: likes.isNotEmpty
                                                      ? Colors.red
                                                      : Colors.grey[600],
                                                ),
                                              ),
                                            ),
                                            if (likes.isNotEmpty) ...[
                                              const SizedBox(width: 5),
                                              const Icon(
                                                Icons.thumb_up,
                                                size: 10,
                                                color: Colors.blue,
                                              ),
                                              const SizedBox(width: 2),
                                              Text(
                                                "${likes.length}",
                                                style: TextStyle(
                                                  color: Colors.grey[600],
                                                  fontSize: 11,
                                                ),
                                              ),
                                            ],
                                            const SizedBox(width: 15),
                                            GestureDetector(
                                              onTap: () =>
                                                  _startReply(cmt['_id'], name),
                                              child: Text(
                                                "Trả lời",
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12,
                                                  color: Colors.grey[600],
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),

                            // --- REPLIES ---
                            if (replies.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(
                                  left: 50,
                                  top: 10,
                                ),
                                child: ListView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: replies.length,
                                  itemBuilder: (context, rIndex) {
                                    final reply = replies[rIndex];
                                    final rUser = reply['user'];
                                    final rName = _getUserName(rUser);
                                    final rAvatar = rUser != null
                                        ? (rUser['avatar'] ??
                                              "https://i.pravatar.cc/150")
                                        : "https://i.pravatar.cc/150";
                                    final List<dynamic> rLikes =
                                        reply['likes'] ?? [];
                                    final String? rImage = reply['image'];

                                    return Padding(
                                      padding: const EdgeInsets.only(
                                        bottom: 10,
                                      ),
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          CircleAvatar(
                                            radius: 12,
                                            backgroundImage: NetworkImage(
                                              rAvatar,
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                GestureDetector(
                                                  onLongPress: () =>
                                                      _showReplyOptionsModal(
                                                        context,
                                                        reply,
                                                        cmt['_id'],
                                                        index,
                                                        rIndex,
                                                      ),
                                                  child: Container(
                                                    padding:
                                                        const EdgeInsets.all(8),
                                                    decoration: BoxDecoration(
                                                      color: Colors.grey[50],
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            12,
                                                          ),
                                                    ),
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Text(
                                                          rName,
                                                          style:
                                                              const TextStyle(
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                fontSize: 12,
                                                              ),
                                                        ),
                                                        if (reply['content']
                                                            .toString()
                                                            .isNotEmpty)
                                                          Text(
                                                            reply['content'],
                                                            style:
                                                                const TextStyle(
                                                                  fontSize: 13,
                                                                ),
                                                          ),
                                                        _buildCommentImage(
                                                          rImage,
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ),
                                                Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                        left: 8,
                                                        top: 2,
                                                      ),
                                                  child: Row(
                                                    children: [
                                                      Text(
                                                        _formatTime(
                                                          reply['createdAt'],
                                                        ),
                                                        style: TextStyle(
                                                          fontSize: 10,
                                                          color:
                                                              Colors.grey[500],
                                                        ),
                                                      ),
                                                      const SizedBox(width: 10),
                                                      GestureDetector(
                                                        onTap: () async {
                                                          final newLikes =
                                                              await ForumService.toggleLikeReply(
                                                                widget.postId,
                                                                cmt['_id'],
                                                                reply['_id'],
                                                              );
                                                          if (newLikes !=
                                                              null) {
                                                            setState(
                                                              () =>
                                                                  _comments[index]['replies'][rIndex]['likes'] =
                                                                      newLikes,
                                                            );
                                                          }
                                                        },
                                                        child: Text(
                                                          "Thích",
                                                          style: TextStyle(
                                                            fontSize: 11,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color:
                                                                rLikes
                                                                    .isNotEmpty
                                                                ? Colors.red
                                                                : Colors
                                                                      .grey[600],
                                                          ),
                                                        ),
                                                      ),
                                                      if (rLikes
                                                          .isNotEmpty) ...[
                                                        const SizedBox(
                                                          width: 3,
                                                        ),
                                                        Text(
                                                          "${rLikes.length}",
                                                          style: TextStyle(
                                                            fontSize: 10,
                                                            color: Colors
                                                                .grey[600],
                                                          ),
                                                        ),
                                                      ],
                                                      const SizedBox(width: 10),
                                                      GestureDetector(
                                                        onTap: () =>
                                                            _startReply(
                                                              cmt['_id'],
                                                              rName,
                                                            ),
                                                        child: Text(
                                                          "Trả lời",
                                                          style: TextStyle(
                                                            fontSize: 11,
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color: Colors
                                                                .grey[600],
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
          ),

          // 3. INPUT AREA
          Container(
            padding: EdgeInsets.only(
              left: 15,
              right: 15,
              top: 10,
              bottom: MediaQuery.of(context).viewInsets.bottom + 10,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey.shade200)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  offset: const Offset(0, -2),
                  blurRadius: 5,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (_replyingCommentId != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      vertical: 8,
                      horizontal: 10,
                    ),
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.blue.shade100),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.reply, size: 16, color: Colors.blue[800]),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "Đang trả lời ${_replyingToName ?? 'người dùng'}",
                            style: TextStyle(
                              color: Colors.blue[800],
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        GestureDetector(
                          onTap: _cancelReply,
                          child: const Icon(
                            Icons.close,
                            size: 18,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),

                if (_pickedImage != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    height: 80,
                    width: double.infinity,
                    alignment: Alignment.centerLeft,
                    child: Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          // Logic quan trọng: Web dùng Image.network, App dùng Image.file
                          child: kIsWeb
                              ? Image.network(
                                  _pickedImage!.path,
                                  height: 80,
                                  width: 80,
                                  fit: BoxFit.cover,
                                )
                              : Image.file(
                                  File(_pickedImage!.path),
                                  height: 80,
                                  width: 80,
                                  fit: BoxFit.cover,
                                ),
                        ),
                        Positioned(
                          right: 0,
                          top: 0,
                          child: GestureDetector(
                            onTap: _removeImage,
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.close,
                                size: 14,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                Row(
                  children: [
                    IconButton(
                      onPressed: () => _showImageSourcePicker(context),
                      icon: const Icon(
                        Icons.camera_alt_outlined,
                        color: Colors.grey,
                      ),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _commentController,
                        focusNode: _focusNode,
                        decoration: InputDecoration(
                          hintText: _replyingCommentId != null
                              ? "Viết câu trả lời..."
                              : "Viết bình luận...",
                          hintStyle: TextStyle(
                            color: Colors.grey[400],
                            fontSize: 14,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 15,
                            vertical: 10,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(25),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: Colors.grey[100],
                        ),
                        maxLines: null,
                      ),
                    ),
                    const SizedBox(width: 10),
                    _isSending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : IconButton(
                            onPressed: _handleSend,
                            icon: Icon(
                              Icons.send,
                              color:
                                  (_replyingCommentId != null ||
                                      _pickedImage != null)
                                  ? Colors.blue
                                  : const Color(0xFF1A237E),
                            ),
                          ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
