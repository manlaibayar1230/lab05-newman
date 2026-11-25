// Спецификацийн жагсаалт (README-ийн спецификацийн хүснэгттэй ижил).
// Даалгавар 1: дулаарлын тест.
module.exports = [
  {
    id: 'T01',
    title: 'Идэвхтэй, урьдач нөхцөл хангасан оюутан бүртгүүлэхэд 201 OK',
    students: [{ id: 'B231234567', body: { status: 'active', coursesTaken: ['CS201'] } }],
    courses: [{ id: 'CS313', body: { prerequisites: ['CS201'] } }],
    post: { studentID: 'B231234567', courseID: 'CS313' },
    expect: { status: 201, result: 'OK' },
    failHere: 200,
  },
];
