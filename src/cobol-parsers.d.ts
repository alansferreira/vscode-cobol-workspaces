


declare module 'cobol-parsers' {
    export const copybook: any;
    export const program: ProgramParser;
    export const jcl: JCLParser;
    
    export interface JCLParser{
        parseJob(content: string): ParsedJob;
        extractReferences(parseJob: ParsedJob): JobReference;
    }

    export interface ParsedJob{
        statements: JobParsedStatement[];
    }
    export interface JobReference {
        
        job?: JobReferenceItem[];
        dd?: JobReferenceItem[];
        program?: JobReferenceItem[];

    }
    export interface JobReferenceItem{
        type: 'job' | 'dd' | 'program';
        reference: JobReferenceSpec;
        startedAtLine: number;
    }    
    export interface JobReferenceSpec{
        jobName?: string;
        programerName?: string;
        datasetName?: string;
        program?: string;

    }
    export interface JobParsedStatement {
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


    export interface ProgramParser{
        parseProgram(content: string): ParsedProgram;
        extractReferences(parseJob: ParsedProgram): ProgramReference;
    }


    export interface ParsedProgram{
        statements: ProgramParsedStatement[];
    }
    export interface ProgramParsedStatement {
        // STMT_TYPE: string;
        // startedAtLine: number;
        // endedAtLine: number;
        // labelName?: string;
        // command?: string;
        // commandArgs?: string;
        // args?: any[];
        // jobName?: string;
        // programerName?: string;
        // datasetName?: string;
        // program?: string;
    }

    export interface ProgramReference {
        
        // job?: ProgramReferenceItem[];
        // dd?: ProgramReferenceItem[];
        // program?: ProgramReferenceItem[];

    }



} 
