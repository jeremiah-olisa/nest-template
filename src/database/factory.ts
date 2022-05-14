// import AppError from "./../utils/app-error";
import APIFeatures from './../utils/api-features';
// import * as mapper from "automapper-js";
import { HydratedDocument, Model as SchemaModel } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

async function deleteOne<TModel>(Model: SchemaModel<TModel>, id) {
  const doc = await Model.findByIdAndDelete(id);

  if (!doc) {
    throw new NotFoundException('No document found with that ID');
  }

  return doc;
}

async function deleteMany<TModel>(Model: SchemaModel<TModel>, ids: string[]) {
  const doc = await Model.deleteMany({ _id: { $in: ids } });

  return doc;
}

async function updateOne<TModel>(Model: SchemaModel<TModel>, id, dto) {
  // let model = mapper(ValidModel, dto);
  const doc = await Model.findByIdAndUpdate(id, dto, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    throw new NotFoundException('No document found with that ID');
  }

  return doc;
}

async function updateSingle<TModel>(Model: SchemaModel<TModel>, queryObj, dto) {
  // let model = mapper(ValidModel, dto);
  const doc = await Model.findOneAndUpdate(queryObj, dto, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    throw new NotFoundException('No document found with that ID');
  }

  return doc;
}

async function updateMany<TModel>(Model: SchemaModel<TModel>, queryObj, dto) {
  // let model = mapper(ValidModel, dto);
  const doc = await Model.updateMany(queryObj, dto, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    throw new NotFoundException('No document found with that ID');
  }

  return doc;
}

async function createOne<TModel>(Model: SchemaModel<TModel>, dto) {
  // let model = mapper(ValidModel, dto);
  const doc = await Model.create(dto);

  return doc;
}

async function createMany<TModel>(Model: SchemaModel<TModel>, dto: Array<{}>) {
  // let model = mapper(ValidModel, dto);
  const doc = await Model.insertMany(dto);

  return doc;
}

async function getOne<TModel>(
  Model: SchemaModel<TModel>,
  id,
  popOptions?: any,
  select?: object,
) {
  let query = Model.findById(id).select(select || {});

  if (popOptions) query = query.populate(popOptions) as any;
  const doc = await query;
  // console.log(query)
  if (!doc) {
    throw new NotFoundException('No document found with that ID');
  }

  return doc;
}

async function single<TModel>(
  Model: SchemaModel<TModel>,
  queryObj: {},
  popOptions?: any,
  select?: object,
) {
  let query: any = Model.findOne(queryObj).select(select || {});

  if (popOptions) query = query.populate(popOptions);
  const doc = await query;
  // console.log(query)
  if (!doc) {
    throw new NotFoundException('No document found with that ID');
  }

  return doc;
}

async function deleteSingle<TModel>(Model: SchemaModel<TModel>, queryObj: {}) {
  const doc = await Model.deleteOne(queryObj);
  // console.log(query)
  if (!doc) {
    throw new NotFoundException('No document found with that ID');
  }

  return doc;
}

// if (req.params.tourId) filter = { tour: req.params.tourId };
// To allow for nested GET reviews on tour (hack)

async function getAll<TModel>(
  Model: SchemaModel<TModel>,
  query?: any,
  filter?: object,
  select?: object,
) {
  const features = new APIFeatures(
    Model.find(filter || {}).select(select || {}),
    query,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // const doc = await features.query.exec();
  const doc = await features.query;

  // SEND RESPONSE
  return doc;
}

export default {
  deleteOne,
  deleteMany,
  deleteSingle,
  updateSingle,
  updateOne,
  updateMany,
  createOne,
  createMany,
  getOne,
  getAll,
  single,
};
