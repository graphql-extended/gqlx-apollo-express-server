declare module 'apollo-upload-server' {
  const uploadServer: {
    apolloUploadExpress: any;
    GraphQLUpload: any;
  };

  export = uploadServer;
}
