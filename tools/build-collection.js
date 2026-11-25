// Postman Collection v2.1 JSON үүсгэгч.
// Спецификаци бүрийг (specs.js) бие даасан folder болгоно: setup PUT-ууд + POST /registrations + oracle-ууд.
// Ажиллуулах: node tools/build-collection.js            -> lab05-collection.json
//             node tools/build-collection.js --fail     -> lab05-collection-fail.json (нэг oracle зориуд буруу)
const fs = require('fs');
const path = require('path');
const specs = require('./specs');

const FAIL = process.argv.includes('--fail');
const root = path.resolve(__dirname, '..');

const json = (o) => JSON.stringify(o, null, 2);

function request(name, method, urlPath, body, exec) {
  const req = {
    name,
    request: {
      method,
      header: body !== undefined ? [{ key: 'Content-Type', value: 'application/json' }] : [],
      url: {
        raw: `{{baseUrl}}${urlPath}`,
        host: ['{{baseUrl}}'],
        path: urlPath.replace(/^\//, '').split('/'),
      },
    },
  };
  if (body !== undefined) {
    req.request.body = {
      mode: 'raw',
      raw: typeof body === 'string' ? body : json(body),
      options: { raw: { language: 'json' } },
    };
  }
  if (exec) req.event = [{ listen: 'test', script: { type: 'text/javascript', exec } }];
  return req;
}

function setupTest(label) {
  return [
    `pm.test("Setup: ${label} -> 200 OK", function () {`,
    '    pm.response.to.have.status(200);',
    '    pm.expect(pm.response.json().result).to.eql("OK");',
    '});',
  ];
}

function oracle(spec) {
  const lines = ['const body = pm.response.json();'];
  let status = spec.expect.status;
  if (FAIL && spec.failHere) status = spec.failHere; // зориуд буруу oracle
  lines.push(
    `pm.test("${spec.title}: статус ${status}", function () {`,
    `    pm.response.to.have.status(${status});`,
    '});',
    `pm.test("${spec.title}: result = ${spec.expect.result}", function () {`,
    `    pm.expect(body.result).to.eql("${spec.expect.result}");`,
    '});'
  );
  if (spec.expect.missing) {
    lines.push(
      `pm.test("${spec.title}: missing = ${JSON.stringify(spec.expect.missing).replace(/"/g, '\\"')}", function () {`,
      `    pm.expect(body.missing).to.eql(${JSON.stringify(spec.expect.missing)});`,
      '});'
    );
  }
  if (spec.expect.result === 'OK') {
    // registrationID-ийн яг утгыг шалгахгүй — сервер in-memory тул хуримтлагдана
    lines.push(
      `pm.test("${spec.title}: registrationID нь эерэг бүхэл тоо", function () {`,
      '    pm.expect(body.registrationID).to.be.a("number");',
      '    pm.expect(Number.isInteger(body.registrationID) && body.registrationID > 0).to.be.true;',
      '    pm.collectionVariables.set("lastRegistrationID", body.registrationID);',
      '});'
    );
  }
  return lines;
}

const items = specs.map((spec) => {
  const reqs = [];
  for (const s of spec.students || []) {
    reqs.push(request(`Setup: оюутан ${s.id}`, 'PUT', `/students/${s.id}`, s.body, setupTest(`оюутан ${s.id}`)));
  }
  for (const c of spec.courses || []) {
    reqs.push(request(`Setup: хичээл ${c.id}`, 'PUT', `/courses/${c.id}`, c.body, setupTest(`хичээл ${c.id}`)));
  }
  reqs.push(request(`POST /registrations — ${spec.title}`, 'POST', '/registrations', spec.post, oracle(spec)));
  for (const extra of spec.extra || []) reqs.push(extra(request));
  return { name: `${spec.id}. ${spec.title}`, item: reqs };
});

const collection = {
  info: {
    name: FAIL ? 'Lab05 — Бүртгэлийн API (FAIL хувилбар)' : 'Lab05 — Бүртгэлийн API',
    description:
      'F.CSA313 Лаб 5. POST /registrations-ийн спецификаци бүр бие даасан folder: setup PUT + POST + oracle.' +
      (FAIL ? ' FAIL хувилбар: нэг oracle зориуд буруу (201-ийн оронд 200 хүлээнэ).' : ''),
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: items,
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3000' },
    { key: 'lastRegistrationID', value: '' },
  ],
};

const out = path.join(root, FAIL ? 'lab05-collection-fail.json' : 'lab05-collection.json');
fs.writeFileSync(out, json(collection) + '\n', 'utf8');
console.log(`${path.basename(out)}: ${items.length} тест (folder)`);
