


declare module 'cobol-parsers' {
    export const copybook: any;
    export const program: any;
    export const jcl: JCLParser;
    
    export interface JCLParser{
        parseJob(content: string): ParsedJob;
        extractReferences(parseJob: ParsedJob): JobReference[];
    }
    export interface ParsedJob{
        statements: ParsedStatement[];
    }
    export interface JobReference {
        type: 'job' | 'dd' | 'program';
        startedAtLine: number;
        reference: JobReferenceSpec;
    }

    export interface JobReferenceSpec{
        jobName?: string;
        programerName?: string;
        datasetName?: string;
        program?: string;

    }
    export interface ParsedStatement {
        STMT_TYPE: string;
        startedAtLine: number;
        endedAtLine: number;
        labelName?: string;
        command?: string;
        commandArgs?: string;
        args?: any[];
        jobName?: string;
        programerName?: string;
        datasetName?: string;
        program?: string;
    }

} 
