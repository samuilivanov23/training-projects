function UserProfile () {
    let full_name = "";
    let id;

    function getName () {
        return full_name;
    }

    function getId () {
        return id;
    }

    function setData (loggedUserName, loggedUserId) {
        full_name = loggedUserName;
        id = loggedUserId;
    }

    return {
        getName : getName,
        getId : getId,
        setData : setData
    }
}

export default UserProfile;