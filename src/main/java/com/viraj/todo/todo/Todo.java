package com.viraj.todo.todo;

import java.time.Instant;

public record Todo(
		long id,
		String title,
		String description,
		boolean completed,
		Instant createdAt,
		Instant updatedAt
) {
}
