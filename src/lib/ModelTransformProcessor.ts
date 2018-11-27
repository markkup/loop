import { IModelTransformer } from '../interfaces';

class ModelTransformProcessor<T> {

    public transformToModel(data: any, transformer: IModelTransformer<T>): T;
    public transformToModel(data: any[], transformer: IModelTransformer<T>): T[];
    public transformToModel(data: any, transformer: IModelTransformer<any>): any {
        if (!data) {
            return null;
        }
        if (data instanceof Array) {
            return data.map((item) => transformer.transform(item));
        } else {
            return transformer.transform(data);
        }
    }
}

export default ModelTransformProcessor;
