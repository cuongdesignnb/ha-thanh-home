import assert from "node:assert/strict";
import { areaForProject, areaProjects, projectsForArea } from "./area-projects";
import { getLegacyRedirectTarget } from "./legacy-redirects";
import { getGscNotFoundTarget } from "./legacy-redirects-gsc";
import { getProjectPageInfo } from "./project-page-kind";

const areas = Object.entries(areaProjects);
assert.equal(areas.length, 17);

const seen = new Set<string>();
for (const [area, projects] of areas) {
  const info = getProjectPageInfo(area);
  assert.ok(info && (info.kind === "area" || info.kind === "pricing") && info.region, `${area} is not an area landing`);
  assert.equal(getLegacyRedirectTarget(`/du-an/${area}`), undefined, `${area} redirects away`);
  assert.ok(projects.length > 0);
  for (const project of projects) {
    assert.equal(getProjectPageInfo(project), undefined, `${project} must be a real project, not a landing`);
    assert.equal(getLegacyRedirectTarget(`/du-an/${project}`), undefined, `${project} redirects away`);
    assert.equal(getGscNotFoundTarget(`/du-an/${project}`), undefined, `${project} redirects away`);
    assert.equal(seen.has(project), false, `${project} is listed under two areas`);
    seen.add(project);
    assert.equal(areaForProject(project), area);
  }
}
assert.equal(seen.size, 22);

// Merged on 2026-11-17: the kept pages carry the projects.
assert.equal(getLegacyRedirectTarget("/du-an/xay-nha-tron-goi-tai-ninh-binh-cong-ty-xay-dung-uy-tin"), "/du-an/bao-gia-xay-nha-tron-goi-tai-ninh-binh-nam-2026");
assert.equal(getLegacyRedirectTarget("/du-an/cap-nhat-bao-gia-xay-nha-tron-goi-tai-nam-dinh-2026-chi-tiet-tung-hang-muc"), "/du-an/xay-nha-tron-goi-tai-nam-dinh");
assert.equal(getGscNotFoundTarget("/xay-nha-tron-goi-tai-ninh-binh"), "/du-an/bao-gia-xay-nha-tron-goi-tai-ninh-binh-nam-2026");
assert.equal(getLegacyRedirectTarget("/du-an/bao-gia-xay-nha-tron-goi-son-tay-ha-noi"), "/du-an/xay-nha-tron-goi-son-tay-cam-ket-chuan-tien-do");
assert.equal(getLegacyRedirectTarget("/dich-vu/xay-nha-tron-goi-tai-luong-son-phu-tho"), "/du-an/xay-nha-tron-goi-tai-hoa-binh-bao-gia-canh-tranh");

assert.deepEqual(projectsForArea("xay-nha-tron-goi-cau-giay"), []);
assert.deepEqual(projectsForArea(undefined), []);
assert.equal(areaForProject("khong-co"), undefined);

console.log(`area-projects: ${seen.size} real projects linked to ${areas.length} area landings`);
