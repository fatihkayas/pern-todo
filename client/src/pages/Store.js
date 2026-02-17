import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Single draggable watch card
function SortableWatchCard({ watch, addToCart }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: watch.watch_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      className="col-md-4 mb-4"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        className="card h-100 shadow-sm border-0 rounded-4"
        style={{
          boxShadow: isDragging ? "0 8px 32px rgba(0,0,0,0.25)" : undefined,
          transform: isDragging ? "scale(1.03)" : undefined,
        }}
      >
        {/* Drag handle indicator */}
        <div className="text-center pt-2 text-muted" style={{ fontSize: "12px", letterSpacing: "2px" }}>
          ⠿ drag to reorder
        </div>

        <div className="bg-light p-4 text-center">
          <img
            src={watch.image_url}
            className="img-fluid"
            style={{ maxHeight: "180px", objectFit: "contain" }}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
            }}
            alt={watch.watch_name}
          />
        </div>

        <div className="card-body">
          <span className="badge bg-secondary mb-2">{watch.brand}</span>
          <h5 className="card-title fw-bold">{watch.watch_name}</h5>
          <p className="card-text text-secondary small">{watch.description}</p>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="h4 mb-0 text-primary">${watch.price}</span>
            <button
              className="btn btn-dark rounded-pill"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(watch);
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Store component
const Store = ({ watches: initialWatches, addToCart }) => {
  const [watches, setWatches] = useState(initialWatches);
  const [search, setSearch] = useState("");

  // Update when parent changes
  React.useEffect(() => {
    setWatches(initialWatches);
  }, [initialWatches]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px drag before activating
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setWatches((items) => {
        const oldIndex = items.findIndex((w) => w.watch_id === active.id);
        const newIndex = items.findIndex((w) => w.watch_id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filtered = watches.filter(
    (w) =>
      w.watch_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-2 fw-bold">⌚ Watch Collection</h3>
      <p className="text-center text-muted small mb-4">
        Drag cards to reorder • {watches.length} watches
      </p>

      {/* Search bar */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="🔍 Search by name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Drag & Drop Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filtered.map((w) => w.watch_id)}
          strategy={rectSortingStrategy}
        >
          <div className="row">
            {filtered.length === 0 ? (
              <p className="text-center text-muted">No watches found.</p>
            ) : (
              filtered.map((watch) => (
                <SortableWatchCard
                  key={watch.watch_id}
                  watch={watch}
                  addToCart={addToCart}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Store;
