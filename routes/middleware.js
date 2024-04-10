function checkBlank(req, res, next)
{

    if(req.body.username == '' || req.body.password == '')
    {
        let redirectUrl = req.url;
        let script = "<script>alert('아이디 또는 비밀번호를 입력해주세요.');location.href='" + redirectUrl + "';</script>";
        return res.send(script);
    }

    next();
}

function printTime(req, res, next)
{
    console.log(new Date());

    next();
}


module.exports = {
    checkBlank,
    printTime,
};