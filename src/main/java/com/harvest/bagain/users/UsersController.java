package com.harvest.bagain.users;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class UsersController {

	@Autowired
	private UsersDAO usersDAO;

	// 이메일 중복 확인
	@GetMapping("/check-email")
	public ResponseEntity<String> checkEmailDuplicate(@RequestParam String email) {
		String result = usersDAO.checkEmailDuplicate(email);
		return ResponseEntity.ok(result);
	}
	
	@GetMapping("/check-login")
	public ResponseEntity<Map<String, Object>> checkLogin(@RequestHeader("Authorization") String token) {
		Map<String, Object> response = new HashMap<>();
		if (usersDAO.validateToken(token)) {
			response.put("status", true);
			response.put("message", "유효한 토큰입니다.");
		} else {
			response.put("status", false);
			response.put("message", "유효하지 않은 토큰입니다.");
		}
		return ResponseEntity.ok(response);
	}
	// 닉네임 중복 확인
	@GetMapping("/check-nickname")
	public ResponseEntity<String> checkNicknameDuplicate(@RequestParam String nickname) {
		String result = usersDAO.checkNicknameDuplicate(nickname);
		return ResponseEntity.ok(result);
	}

	// 사용자 등록 (회원가입)
	@PostMapping("/join")
	public ResponseEntity<String> join(@Validated @ModelAttribute UserJoinReq req,
			@RequestParam(required = false) MultipartFile photo) {
		String result = usersDAO.join(req, photo);
		return ResponseEntity.ok(result);
	}

	@PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestParam String email, @RequestParam String password) {
        Map<String, Object> result = usersDAO.login(email, password);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/info")
    public ResponseEntity<String> userInfo(Authentication auth) {
        Users loginUser = usersDAO.getLoginUserByEmail(auth.getName());
        return ResponseEntity.ok(String.format("email: %s\nnickname: %s", loginUser.getEmail(), loginUser.getNickname()));
    }


	@PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", true);
        response.put("message", "로그아웃 성공");
        return ResponseEntity.ok(response);
    }
}