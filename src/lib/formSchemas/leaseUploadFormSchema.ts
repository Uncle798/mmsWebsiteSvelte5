import * as v from 'valibot';

export const leaseUploadFormSchema = v.object({
   lease: v.pipe(v.file(), v.mimeType(['application/pdf']), v.maxSize(1024*1024*10, 'Please upload a file smaller than 100mb'))
})