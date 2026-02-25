import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Watch } from "../types";

function fixImageUrl(url: string | undefined): string {
  if (!url) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
}

interface SortableWatchCardProps {
  watch: Watch;
  addToCart: (watch: Watch) => void;
}

function SortableWatchCard({ watch, addToCart }: SortableWatchCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: watch.watch_id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const imageUrl = fixImageUrl(watch.image_url);

  return (
    <div className="col-md-4 mb-4" ref={setNodeRef} style={style}>
      <div
        className="card h-100 shadow-sm border-0 rounded-4"
        style={{ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
      >
        <div
          {...attributes}
          {...listeners}
          className="text-center pt-2 text-muted"
          style={{ fontSize: "12px", letterSpacing: "2px", cursor: "grab" }}
        >
          ⠿ drag to reorder
        </div>

        <div className="bg-light p-4 text-center" onClick={() => navigate(`/watch/${watch.watch_id}`)}>
          <img
            src={imageUrl}
            className="img-fluid"
            style={{ maxHeight: "180px", objectFit: "contain" }}
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"; }}
            alt={watch.watch_name}
          />
        </div>

        <div className="card-body" onClick={() => navigate(`/watch/${watch.watch_id}`)}>
          <span className="badge bg-secondary mb-2">{watch.brand}</span>
          <h5 className="card-title fw-bold" style={{ fontSize: "14px" }}>{watch.watch_name}</h5>
          <p className="card-text text-secondary small" style={{
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {watch.description}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="h5 mb-0 text-primary">${watch.price}</span>
            <button
              className="btn btn-dark rounded-pill btn-sm"
              onClick={(e) => { e.stopPropagation(); addToCart(watch); }}
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

interface StoreProps {
  watches: Watch[];
  addToCart: (watch: Watch) => void;
}

const Store = ({ watches: initialWatches, addToCart }: StoreProps) => {
  const [watches, setWatches] = useState<Watch[]>(Array.isArray(initialWatches) ? initialWatches : []);
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    setWatches(initialWatches);
  }, [initialWatches]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setWatches((items) => {
        const oldIndex = items.findIndex((w) => w.watch_id === active.id);
        const newIndex = items.findIndex((w) => w.watch_id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filtered = watches.filter(
    (w) =>
      w.watch_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.brand?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-2 fw-bold">⌚ Watch Collection</h3>
      <p className="text-center text-muted small mb-4">
        Drag cards to reorder • {watches.length} watches
      </p>

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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map((w) => w.watch_id)} strategy={rectSortingStrategy}>
          <div className="row">
            {filtered.length === 0 ? (
              <p className="text-center text-muted">Saat bulunamadı.</p>
            ) : (
              filtered.map((watch) => (
                <SortableWatchCard key={watch.watch_id} watch={watch} addToCart={addToCart} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Store;
