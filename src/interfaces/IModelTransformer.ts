export default interface IModelTransformer<T = any> {
    transform(item: any): T;
}
