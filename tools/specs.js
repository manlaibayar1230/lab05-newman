// Спецификацийн жагсаалт (README-ийн спецификацийн хүснэгттэй ижил).
// Тест бүр өөрийн оюутан/хичээлийн ID-тай тул бусдаасаа хамааралгүй (test independence);
// PUT нь бичлэгийг бүхэлд нь дахин бичдэг тул давтан ажиллуулахад аюулгүй.
const ACTIVE = (taken) => ({ status: 'active', coursesTaken: taken });
const INACTIVE = (taken) => ({ status: 'inactive', coursesTaken: taken });

module.exports = [
  {
    id: 'T01',
    title: 'Идэвхтэй, урьдач нөхцөл хангасан оюутан бүртгүүлэхэд 201 OK',
    students: [{ id: 'B231234567', body: ACTIVE(['CS201']) }],
    courses: [{ id: 'CS313', body: { prerequisites: ['CS201'] } }],
    post: { studentID: 'B231234567', courseID: 'CS313' },
    expect: { status: 201, result: 'OK' },
    failHere: 200, // FAIL хувилбарт 201-ийн оронд 200 хүлээнэ
    extra: [
      (request) =>
        request('GET /registrations — шинэ бүртгэл жагсаалтад орсон', 'GET', '/registrations', undefined, [
          'pm.test("T01: GET /registrations-д шинэ бүртгэл (B231234567, CS313) байна", function () {',
          '    pm.response.to.have.status(200);',
          '    const id = Number(pm.collectionVariables.get("lastRegistrationID"));',
          '    const found = pm.response.json().find(r => r.registrationID === id);',
          '    pm.expect(found).to.include({ studentID: "B231234567", courseID: "CS313" });',
          '});',
        ]),
    ],
  },
  {
    id: 'T02',
    title: 'Байхгүй оюутан бүртгүүлэхэд ERROR_NO_STUDENT',
    courses: [{ id: 'CS313T02', body: { prerequisites: ['CS201'] } }],
    post: { studentID: 'B23NOSTUDENT02', courseID: 'CS313T02' },
    expect: { status: 200, result: 'ERROR_NO_STUDENT' },
  },
  {
    id: 'T03',
    title: 'Идэвхгүй оюутан бүртгүүлэхэд ERROR_INACTIVE_STUDENT',
    students: [{ id: 'B23T03', body: INACTIVE(['CS201']) }],
    courses: [{ id: 'CS313T03', body: { prerequisites: ['CS201'] } }],
    post: { studentID: 'B23T03', courseID: 'CS313T03' },
    expect: { status: 200, result: 'ERROR_INACTIVE_STUDENT' },
  },
  {
    id: 'T04',
    title: 'Байхгүй хичээлд бүртгүүлэхэд ERROR_NO_COURSE',
    students: [{ id: 'B23T04', body: ACTIVE(['CS201']) }],
    post: { studentID: 'B23T04', courseID: 'CS999T04' },
    expect: { status: 200, result: 'ERROR_NO_COURSE' },
  },
  {
    id: 'T05',
    title: 'Урьдач хичээлийг огт үзээгүй бол ERROR_PREREQUISITES (missing CS201)',
    students: [{ id: 'B23T05', body: ACTIVE([]) }],
    courses: [{ id: 'CS313T05', body: { prerequisites: ['CS201'] } }],
    post: { studentID: 'B23T05', courseID: 'CS313T05' },
    expect: { status: 200, result: 'ERROR_PREREQUISITES', missing: ['CS201'] },
  },
  {
    id: 'T06',
    title: 'Урьдач хичээлийн зарим нь дутуу бол ERROR_PREREQUISITES (missing CS202)',
    students: [{ id: 'B23T06', body: ACTIVE(['CS201']) }],
    courses: [{ id: 'CS313T06', body: { prerequisites: ['CS201', 'CS202'] } }],
    post: { studentID: 'B23T06', courseID: 'CS313T06' },
    expect: { status: 200, result: 'ERROR_PREREQUISITES', missing: ['CS202'] },
  },
  {
    id: 'T07',
    title: 'Оюутан ба хичээл хоёулаа байхгүй бол ERROR_NO_STUDENT (оюутан түрүүлж шалгагдана)',
    post: { studentID: 'B23NOSTUDENT07', courseID: 'CS999T07' },
    expect: { status: 200, result: 'ERROR_NO_STUDENT' },
  },
  {
    id: 'T08',
    title: 'Идэвхгүй ба урьдач дутуу оюутанд ERROR_INACTIVE_STUDENT',
    students: [{ id: 'B23T08', body: INACTIVE([]) }],
    courses: [{ id: 'CS313T08', body: { prerequisites: ['CS201'] } }],
    post: { studentID: 'B23T08', courseID: 'CS313T08' },
    expect: { status: 200, result: 'ERROR_INACTIVE_STUDENT' },
  },
  {
    id: 'T09',
    title: 'Идэвхгүй оюутан байхгүй хичээлд бүртгүүлэхэд ERROR_INACTIVE_STUDENT',
    students: [{ id: 'B23T09', body: INACTIVE(['CS201']) }],
    post: { studentID: 'B23T09', courseID: 'CS999T09' },
    expect: { status: 200, result: 'ERROR_INACTIVE_STUDENT' },
  },
  {
    id: 'T10',
    title: 'Урьдачгүй хичээлд хоосон coursesTaken-тай оюутан бүртгүүлэхэд 201 OK',
    students: [{ id: 'B23T10', body: ACTIVE([]) }],
    courses: [{ id: 'CS101T10', body: { prerequisites: [] } }],
    post: { studentID: 'B23T10', courseID: 'CS101T10' },
    expect: { status: 201, result: 'OK' },
  },
  {
    id: 'T11',
    title: 'courseID талбар дутуу бол 400 ERROR_BAD_REQUEST',
    students: [{ id: 'B23T11', body: ACTIVE(['CS201']) }],
    courses: [{ id: 'CS313T11', body: { prerequisites: ['CS201'] } }],
    post: { studentID: 'B23T11' },
    expect: { status: 400, result: 'ERROR_BAD_REQUEST' },
  },
  {
    id: 'T12',
    title: 'studentID талбар дутуу бол 400 ERROR_BAD_REQUEST',
    post: { courseID: 'CS313' },
    expect: { status: 400, result: 'ERROR_BAD_REQUEST' },
  },
  {
    id: 'T13',
    title: 'Буруу JSON илгээхэд 400 ERROR_BAD_JSON',
    post: '{"studentID": "B23',
    expect: { status: 400, result: 'ERROR_BAD_JSON' },
  },
];
