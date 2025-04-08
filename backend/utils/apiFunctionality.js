class APIFunctionality {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        if (this.queryStr.keyword && this.queryStr.keyword.trim() !== "") {
            const keyword = {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: "i" // Case-insensitive search
                }
            };
            this.query = this.query.find({ ...keyword });
        } else {
            console.log("No keyword provided for search.");
        }

        return this;
    }
    filter(){
        let queryCopy = {...this.queryStr };
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach(key => delete queryCopy[key])
        console.log(queryCopy)

        this.query = this.query.find(queryCopy)
        return this
    }
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page  || 1);
        const skip = resultPerPage * (currentPage -1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
        
    }
}

export default APIFunctionality;
