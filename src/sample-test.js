describe('top level suite 1', function () {
  let foo = 2;

  it('should finish after some time', function (done) {
    setTimeout(done, 3000);
  });

  it('should finish when the promise is resolved', function () {
    return new Promise(function (resolve) {
      setTimeout(resolve, 1000);
    });
  });

  it('should reject', function (done) {
    setTimeout(function () {
      throw new Error('foobar');
    }, 3000);
  });

  it('should finish immediately', function () {
    foo = 3;
  });

  describe('inner suite', function () {
    it('should finish immediately', function () {
      foo = 4;
    });
  });
});

describe('top level suite 2', function () {
  it('should finish immediately (inner 2)', function () {});

  it('should reject 2', function (done) {
    setTimeout(function () {
      throw new Error('foobar');
    }, 8000);
  });
});
