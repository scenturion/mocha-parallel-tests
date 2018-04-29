describe('suite', function () {
  let foo = 2;

  it('should finish after some time', function (done) {
    setTimeout(done, 100);
  });

  it('should finish when the promise is resolved', function () {
    return new Promise(function (resolve) {
      setTimeout(resolve, 100);
    });
  });

  it('should reject', function (done) {
    setTimeout(function () {
      throw new Error('foobar');
    }, 100);
  });

  it('should finish immediately', function () {
    foo = 3;
  });
});
