package com.viraj.todo.todo;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class TodoController {
	private final TodoService todoService;

	public TodoController(TodoService todoService) {
		this.todoService = todoService;
	}

	@GetMapping
	public List<Todo> findAll() {
		return todoService.findAll();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Todo create(@RequestBody TodoRequest request) {
		return todoService.create(request);
	}

	@PutMapping("/{id}")
	public Todo update(@PathVariable long id, @RequestBody TodoRequest request) {
		return todoService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable long id) {
		todoService.delete(id);
	}
}
