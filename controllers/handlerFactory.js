const catchError = require('./../utils/CatchError');
const AppError = require('./../utils/AppError');
const APIFeatures = require('./../utils/APIFeatures');

exports.deleteOne = (Model) =>
  catchError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`Document with id:${req.params.id} not found`, 404)
      );
    }
    res.status(204).json({
      status: 'Data deleted',
      data: doc
    });
  });

exports.updateOne = (Model) =>
  catchError(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError(`Tour with id:${req.params.id} not found`, 404));
    }
    res.status(200).json({
      status: 'Document updated',
      data: doc
    });
  });

exports.getOne = (Model, popOption) =>
  catchError(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(`Document with id:${req.params.id} not found`, 404)
      );
    }

    res.status(200).json({
      status: 'Document succesfully found!',
      data: doc
    });
  });

exports.getAll = (Model) =>
  catchError(async (req, res, next) => {
    //to allow nested routes on tours/reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //
    console.log(Model);
    const queryFeature = new APIFeatures(Model.find(filter), req.query, Model)
      .filter()
      .sort()
      .pagination();
    //EXCECUTE THE QUERY
    const doc = await queryFeature.query;
    res.status(200).json({
      status: 'success',
      elements: doc.length,
      doc
    });
  });
