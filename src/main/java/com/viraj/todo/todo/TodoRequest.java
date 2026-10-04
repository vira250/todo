package com.viraj.todo.todo;

public record TodoRequest(String title, String description, boolean completed) {
}
