

## Fix: react-leaflet peer dependency conflict

**Problem**: `react-leaflet@5.0.0` requires React 19, but the project uses React 18.

**Solution**: Downgrade to `react-leaflet@4.2.1` which supports React 18. The API is identical for the components used (`MapContainer`, `TileLayer`, `Marker`, `Popup`, `useMap`).

### Changes

1. **`package.json`** — Change `react-leaflet` version from `^5.0.0` to `^4.2.1`

That's it — no code changes needed, the v4 API is the same for everything used in `NodeMap.tsx`.

### On the Pi

After I make the change, re-pull and run:
```bash
npm install
npm run build
```

