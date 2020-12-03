class APIFeatures {
  constructor(query, queryReq, Model) {
    this.query = query;
    this.queryReq = queryReq;
    this.Model = Model;
  }
  filter() {
    const discardParms = ['sort', 'limit', 'page'];
    const queryObj = { ...this.queryReq };
    discardParms.forEach((el) => delete queryObj[el]); // THIS FILTER RESERVED KEYWORDS PASS ON THE QUERY FOR FUTURE METHODS LIKE SORTING, LIMIT OR PAGINATIONS
    const queryStr = JSON.stringify(queryObj).replace(
      /\bgte|gt|lte\b/g,
      (match) => `$${match}`
    ); //MATCH A REGULAR EXPRESSION AND INSERTS $ for MONGOOSE FILTER PUPOSES

    // QUERY OBJECT
    console.log(JSON.parse(queryStr));
    this.query = this.Model.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryReq.sort) {
      const sortBy = this.queryReq.sort.replace(',', ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }
  pagination() {
    const page = this.queryReq.page * 1 || 1; // convert to number and add default value
    const limit = this.queryReq.limit * 1 || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
