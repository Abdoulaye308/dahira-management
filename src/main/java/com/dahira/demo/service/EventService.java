package com.dahira.demo.event;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public Event create(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> findAll() {
        return eventRepository.findAll();
    }

    public Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Événement introuvable."));
    }

    public Event update(Long id, Event event) {

        Event existing = findById(id);

        existing.setTitle(event.getTitle());
        existing.setDescription(event.getDescription());
        existing.setLocation(event.getLocation());
        existing.setStartDate(event.getStartDate());
        existing.setEndDate(event.getEndDate());
        existing.setStatus(event.getStatus());

        return eventRepository.save(existing);
    }

    public void delete(Long id) {
        Event event = findById(id);
        eventRepository.delete(event);
    }

    public List<Event> findByStatus(String status) {
        return eventRepository.findByStatus(status);
    }
}