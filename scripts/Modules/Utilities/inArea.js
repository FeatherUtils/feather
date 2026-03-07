export function isPointInCube(px, py, pz, x1, y1, z1, x2, y2, z2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2);
    const maxZ = Math.max(z1, z2);

    return (
        px >= minX &&
        px <= maxX &&
        py >= minY &&
        py <= maxY &&
        pz >= minZ &&
        pz <= maxZ
    );
}
export function isInCuboid(p, loc1, loc2) {
    return isPointInCube(p.x, p.y, p.z, loc1.x, -70, loc1.z, loc2.x, 320, loc2.z)
}