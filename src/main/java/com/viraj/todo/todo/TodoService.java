package com.viraj.todo.todo;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TodoService {
	private final AtomicLong nextId = new AtomicLong(1);
	private final ConcurrentMap<Long, Todo> todos = new ConcurrentHashMap<>();

	public List<Todo> findAll() {
		return todos.values().stream()
				.sorted(Comparator.comparing(Todo::createdAt).reversed())
				.toList();
	}

	public Todo create(TodoRequest request) {
		String title = validatedTitle(request);
		Instant now = Instant.now();
		Todo todo = new Todo(nextId.getAndIncrement(), title, cleanDescription(request.description()),
				false, now, now);
		todos.put(todo.id(), todo);
		return todo;
	}

	public Todo update(long id, TodoRequest request) {
		if (!todos.containsKey(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found");
		}
		Todo current = todos.get(id);
		Todo updated = new Todo(id, validatedTitle(request), cleanDescription(request.description()),
				request.completed(), current.createdAt(), Instant.now());
		todos.put(id, updated);
		return updated;
	}

	public void delete(long id) {
		if (todos.remove(id) == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found");
		}
	}

	private String validatedTitle(TodoRequest request) {
		if (request == null || request.title() == null || request.title().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
		}
		String title = request.title().trim();
		if (title.length() > 120) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be 120 characters or fewer");
		}
		return title;
	}

	private String cleanDescription(String description) {
		return description == null ? "" : description.trim();
	}
}
