export {
    join
}

function join(...paths: string[]): string {
    if (paths && paths.length) {
        let result = "",
            wasQuery = false,
            i = 0;
        const length = paths.length;
        for (i; i < length; i++) {
            if (paths[i] != null) {
                // removing repeating slashes
                let path = paths[i].replace(/^(\/(?!\/))|(\/{2,})$/, "");
                if (path.charAt(path.length - 1) === ":")
                    path += "//";
                switch (path.charAt(0)) {
                    //Slash is not allowed before fragment. If a parh after fragment slash is necessare
                    case "#":
                        if (!!paths[i + 1])
                            result += "/" + path;
                        else
                            result += path;
                        break;
                    //Slash is not allowed before query
                    case "&":
                        result += path;
                        break;
                    //Parts of query should by delimited by '&'
                    case "?":
                        if (!wasQuery) {
                            wasQuery = true;
                            result += path;
                        } else
                            result += "&" + path.substring(1);
                        break;
                    default:
                        result += (!result || !!result && result.charAt(result.length - 1) === "/") ? path : "/" + path;
                        break;
                }
            }
        }
        return result;
    }
    return "";
}
